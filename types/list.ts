import type { Company } from "./company";

export interface CompanyList {
  id: string;
  name: string;
  description?: string;
  company_count?: number;
  companies?: Company[];
}
