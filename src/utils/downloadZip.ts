import JSZip from 'jszip';

const PROXY_BASE = 'https://functions.poehali.dev/fcc54a8e-db90-42b9-a27f-0cb8b29693a0';

export interface ZipFileItem {
  url: string;
  name: string;
}

/**
 * Скачивает все переданные файлы через прокси и упаковывает их в один ZIP-архив
 * прямо в браузере. Дубли имён внутри архива автоматически переименовываются
 * (file (2).pdf и т.д.). Если хотя бы один файл скачался — архив отдаётся.
 *
 * @returns количество успешно добавленных в архив файлов
 */
export const downloadFilesAsZip = async (
  files: ZipFileItem[],
  zipName = 'files.zip',
): Promise<number> => {
  const zip = new JSZip();
  const usedNames = new Set<string>();
  let added = 0;

  const uniqueName = (raw: string): string => {
    const base = (raw || 'file').replace(/[/\\?%*:|"<>]/g, '_').trim() || 'file';
    if (!usedNames.has(base)) {
      usedNames.add(base);
      return base;
    }
    const dot = base.lastIndexOf('.');
    const stem = dot > 0 ? base.slice(0, dot) : base;
    const ext = dot > 0 ? base.slice(dot) : '';
    let i = 2;
    let candidate = `${stem} (${i})${ext}`;
    while (usedNames.has(candidate)) {
      i += 1;
      candidate = `${stem} (${i})${ext}`;
    }
    usedNames.add(candidate);
    return candidate;
  };

  await Promise.all(
    files.map(async (file) => {
      const proxied = `${PROXY_BASE}?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.name || 'file')}`;
      try {
        const res = await fetch(proxied);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        zip.file(uniqueName(file.name), blob);
        added += 1;
      } catch (err) {
        console.error('ZIP: не удалось скачать файл', file.url, err);
      }
    }),
  );

  if (added === 0) {
    throw new Error('Не удалось скачать ни одного файла');
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const objectUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = zipName.endsWith('.zip') ? zipName : `${zipName}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 0);

  return added;
};
