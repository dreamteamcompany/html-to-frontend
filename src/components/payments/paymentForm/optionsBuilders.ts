import { Category, Contractor, CustomerDepartment, LegalEntity, Service } from './types';

export const buildServiceOptions = (services: Service[]) =>
  services.map((s) => ({
    value: s.id.toString(),
    label: s.name,
    sublabel: s.description || undefined,
  }));

export const buildCategoryOptions = (categories: Category[]) =>
  categories.map((c) => ({
    value: c.id.toString(),
    label: c.name,
    icon: c.icon || undefined,
  }));

export const buildLegalEntityOptions = (legalEntities: LegalEntity[]) =>
  legalEntities.map((e) => ({
    value: e.id.toString(),
    label: e.name,
    sublabel: e.inn ? `ИНН: ${e.inn}` : undefined,
  }));

export const buildContractorOptions = (contractors: Contractor[]) =>
  contractors.map((c) => ({
    value: c.id.toString(),
    label: c.name,
    sublabel: c.inn ? `ИНН: ${c.inn}` : undefined,
  }));

export const buildDepartmentOptions = (customerDepartments: CustomerDepartment[]) =>
  customerDepartments.map((d) => ({
    value: d.id.toString(),
    label: d.name,
    sublabel: d.description || undefined,
  }));

export const resolveServiceDescription = (services: Service[], id?: string): string => {
  if (!id) return '';
  const s = services.find((x) => x.id.toString() === id);
  return s?.description || '';
};
