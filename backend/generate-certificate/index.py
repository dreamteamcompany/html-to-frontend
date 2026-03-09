import json
import os
import base64
import urllib.request
import tempfile
import psycopg2
from psycopg2.extras import RealDictCursor
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import date


RESULT_LABELS = {
    'grand_prix': 'Гран-При',
    'first_degree': 'Диплом I степени',
    'second_degree': 'Диплом II степени',
    'third_degree': 'Диплом III степени',
    'participant': 'Участник',
}

COLORS = {
    'primary': HexColor('#1a1a2e'),
    'accent': HexColor('#e94560'),
    'light_gray': HexColor('#f5f5f5'),
    'mid_gray': HexColor('#cccccc'),
    'text_dark': HexColor('#333333'),
    'text_muted': HexColor('#666666'),
}

RESULT_COLORS = {
    'grand_prix': HexColor('#d4a017'),
    'first_degree': HexColor('#d4a017'),
    'second_degree': HexColor('#9e9e9e'),
    'third_degree': HexColor('#cd7f32'),
    'participant': HexColor('#4a90d9'),
}

LOGO_URL      = 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/2aa89901-38a4-48dd-b954-f55aec2d1508.png'
SIGN_STAMP_URL = 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/57089395-3617-4837-8eb4-5a611478b79f.png'

_img_cache: dict = {}

def fetch_image(url: str) -> BytesIO:
    if url in _img_cache:
        return BytesIO(_img_cache[url])
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = resp.read()
    _img_cache[url] = data
    return BytesIO(data)

_fonts_registered = False

SYSTEM_FONT_CANDIDATES = [
    # DejaVu (Debian/Ubuntu)
    ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',      '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),
    ('/usr/share/fonts/dejavu/DejaVuSans.ttf',               '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf'),
    # Liberation (RedHat/CentOS)
    ('/usr/share/fonts/liberation/LiberationSans-Regular.ttf', '/usr/share/fonts/liberation/LiberationSans-Bold.ttf'),
    ('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'),
    # FreeFonts
    ('/usr/share/fonts/truetype/freefont/FreeSans.ttf',      '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf'),
    # reportlab bundled
    (os.path.join(os.path.dirname(__file__), 'fonts', 'DejaVuSans.ttf'),
     os.path.join(os.path.dirname(__file__), 'fonts', 'DejaVuSans-Bold.ttf')),
]


def ensure_fonts():
    global _fonts_registered
    if _fonts_registered:
        return

    for regular_path, bold_path in SYSTEM_FONT_CANDIDATES:
        if os.path.exists(regular_path) and os.path.exists(bold_path):
            pdfmetrics.registerFont(TTFont('DejaVu', regular_path))
            pdfmetrics.registerFont(TTFont('DejaVu-Bold', bold_path))
            _fonts_registered = True
            return

    raise RuntimeError(
        'No suitable Cyrillic TTF font found. Searched: ' +
        str([r for r, b in SYSTEM_FONT_CANDIDATES])
    )


def build_pdf(result: dict) -> bytes:
    ensure_fonts()

    F = 'DejaVu'
    FB = 'DejaVu-Bold'

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20*mm,
        rightMargin=20*mm,
        topMargin=15*mm,
        bottomMargin=15*mm,
    )

    width, _ = A4
    usable_width = width - 40*mm
    styles = getSampleStyleSheet()

    def S(name, **kw):
        return ParagraphStyle(name, parent=styles['Normal'], **kw)

    title_style   = S('T',  fontSize=22, textColor=COLORS['primary'],  alignment=TA_CENTER, spaceAfter=2*mm,  leading=28, fontName=FB)
    subtitle_style= S('ST', fontSize=11, textColor=COLORS['text_muted'],alignment=TA_CENTER, spaceAfter=1*mm,  fontName=F)
    label_style   = S('L',  fontSize=9,  textColor=COLORS['text_muted'],fontName=F,          spaceAfter=0.5*mm)
    value_style   = S('V',  fontSize=12, textColor=COLORS['text_dark'], fontName=FB,          spaceAfter=3*mm,  leading=16)
    footer_style  = S('F',  fontSize=8,  textColor=COLORS['text_muted'],alignment=TA_CENTER, fontName=F)
    result_style  = S('R',  fontSize=16, textColor=white,               alignment=TA_CENTER, fontName=FB,      leading=20)
    docnum_style  = S('D',  fontSize=8,  textColor=COLORS['text_muted'],alignment=TA_RIGHT,  fontName=F)
    intro_style   = S('I',  fontSize=11, textColor=COLORS['text_dark'], alignment=TA_CENTER, fontName=F,       spaceAfter=5*mm, leading=16)

    result_value = result.get('result', 'participant')
    result_label = RESULT_LABELS.get(result_value, result_value)
    result_color = RESULT_COLORS.get(result_value, COLORS['accent'])

    issued_str = date.today().strftime('%d.%m.%Y')

    created_at = result.get('created_at', '')
    try:
        participation_date = date.fromisoformat(str(created_at)[:10]).strftime('%d.%m.%Y')
    except Exception:
        participation_date = issued_str

    full_name   = result.get('full_name') or '—'
    age         = result.get('age')
    teacher     = result.get('teacher') or '—'
    institution = result.get('institution') or '—'
    contest_name= result.get('contest_name') or '—'
    work_title  = result.get('work_title') or '—'
    result_id   = result.get('id', '')

    story = []

    # --- Шапка: логотип по центру ---
    try:
        logo_img = Image(fetch_image(LOGO_URL), width=45*mm, height=45*mm, kind='proportional')
        logo_img.hAlign = 'CENTER'
        story.append(logo_img)
        story.append(Spacer(1, 3*mm))
    except Exception:
        pass

    story.append(Paragraph('СПРАВКА-ПОДТВЕРЖДЕНИЕ', title_style))
    story.append(Paragraph('об участии в конкурсе', subtitle_style))
    story.append(Spacer(1, 3*mm))
    story.append(HRFlowable(width=usable_width, thickness=2, color=COLORS['accent'], spaceAfter=4*mm))

    story.append(Paragraph(f'№ {result_id} от {issued_str}', docnum_style))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        'Настоящая справка подтверждает, что нижеуказанный участник<br/>'
        'принял(а) участие в конкурсе и был(а) отмечен(а) следующим образом:',
        intro_style
    ))

    result_table = Table([[Paragraph(result_label, result_style)]], colWidths=[usable_width], rowHeights=[14*mm])
    result_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), result_color),
        ('VALIGN',     (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3*mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3*mm),
    ]))
    story.append(result_table)
    story.append(Spacer(1, 6*mm))

    def row(label, value):
        return [Paragraph(label, label_style), Paragraph(str(value), value_style)]

    age_str = f'{age} лет' if age else '—'

    data = [
        row('ФИО участника',            full_name),
        row('Возраст',                  age_str),
        row('Конкурс',                  contest_name),
        row('Номинация / Работа',       work_title),
        row('Руководитель / Тренер',    teacher),
        row('Организация / Учреждение', institution),
        row('Дата участия',             participation_date),
        row('Дата выдачи справки',      issued_str),
    ]

    info_table = Table(data, colWidths=[55*mm, usable_width - 55*mm])
    info_table.setStyle(TableStyle([
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING',   (0,0), (-1,-1), 3*mm),
        ('RIGHTPADDING',  (0,0), (-1,-1), 3*mm),
        ('TOPPADDING',    (0,0), (-1,-1), 1*mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1*mm),
        ('ROWBACKGROUNDS',(0,0), (-1,-1), [COLORS['light_gray'], white]),
        ('LINEBELOW',     (0,0), (-1,-2), 0.3, COLORS['mid_gray']),
        ('LINEBEFORE',    (1,0), (1,-1),  1,   COLORS['mid_gray']),
    ]))
    story.append(info_table)

    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width=usable_width, thickness=1, color=COLORS['mid_gray'], spaceAfter=4*mm))

    # --- Подвал: подпись и печать ---
    sign_label_style = S('SL', fontSize=9, textColor=COLORS['text_muted'], fontName=F, spaceAfter=0)
    sign_name_style  = S('SN', fontSize=10, textColor=COLORS['text_dark'], fontName=FB, spaceAfter=0)

    # Левая колонка — должность и ФИО
    left_col = [
        Paragraph('Руководитель:', sign_label_style),
        Spacer(1, 2*mm),
        Paragraph('Мозжерина Анна Владимировна', sign_name_style),
    ]

    # Правая колонка — единая картинка подписи+печати
    right_col = []
    try:
        sign_stamp_img = Image(fetch_image(SIGN_STAMP_URL), width=55*mm, height=55*mm, kind='proportional')
        right_col.append(sign_stamp_img)
    except Exception:
        right_col.append(Spacer(1, 55*mm))

    sign_table = Table(
        [[left_col, right_col]],
        colWidths=[usable_width * 0.5, usable_width * 0.5],
    )
    sign_table.setStyle(TableStyle([
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN',         (0,0), (0,0),   'LEFT'),
        ('ALIGN',         (1,0), (1,0),   'RIGHT'),
        ('LEFTPADDING',   (0,0), (-1,-1), 0),
        ('RIGHTPADDING',  (0,0), (-1,-1), 0),
        ('TOPPADDING',    (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(sign_table)

    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width=usable_width, thickness=0.5, color=COLORS['mid_gray'], spaceAfter=2*mm))
    story.append(Paragraph(
        'Справка выдана для предъявления по месту требования. '
        f'Документ сформирован автоматически • ID записи: {result_id}',
        footer_style
    ))

    doc.build(story)
    return buffer.getvalue()


def handler(event: dict, context) -> dict:
    '''Генерация PDF справки-подтверждения участия в конкурсе по result_id'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': '',
            'isBase64Encoded': False,
        }

    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False,
        }

    params = event.get('queryStringParameters') or {}
    result_id = params.get('id')

    if not result_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Parameter id is required'}),
            'isBase64Encoded': False,
        }

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                'SELECT id, full_name, age, teacher, institution, work_title, '
                'contest_name, result, diploma_issued_at, created_at '
                'FROM results WHERE id = %s',
                (result_id,)
            )
            result = cur.fetchone()

        if not result:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Result not found'}),
                'isBase64Encoded': False,
            }

        result['diploma_issued_at'] = result['diploma_issued_at'].isoformat() if result.get('diploma_issued_at') else None
        result['created_at'] = result['created_at'].isoformat() if result.get('created_at') else None

        pdf_bytes = build_pdf(dict(result))
        pdf_b64 = base64.b64encode(pdf_bytes).decode('utf-8')

        # Записываем лог выдачи справки
        with conn.cursor() as log_cur:
            log_cur.execute(
                'INSERT INTO certificates_log (result_id, full_name, contest_name) VALUES (%s, %s, %s)',
                (result_id, result.get('full_name', ''), result.get('contest_name', ''))
            )
            conn.commit()

        full_name_safe = (result.get('full_name') or 'certificate').replace(' ', '_')
        filename = f'certificate_{result_id}_{full_name_safe}.pdf'

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/pdf',
                'Content-Disposition': f'attachment; filename="{filename}"',
                'Access-Control-Allow-Origin': '*',
            },
            'body': pdf_b64,
            'isBase64Encoded': True,
        }

    finally:
        conn.close()