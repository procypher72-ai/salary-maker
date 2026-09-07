const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('salary_maker_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Session invalid');
    return data;
  },

  // Templates
  getTemplates: async () => {
    const res = await fetch(`${API_BASE}/templates`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch templates');
    return data;
  },

  getTemplateByKey: async (key) => {
    const res = await fetch(`${API_BASE}/templates/${key}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch template');
    return data;
  },

  updateTemplate: async (key, data) => {
    const res = await fetch(`${API_BASE}/templates/${key}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Failed to update template');
    return resData;
  },

  // Companies
  getCompanies: async () => {
    const res = await fetch(`${API_BASE}/companies`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch companies');
    return data;
  },

  getCompanyById: async (id) => {
    const res = await fetch(`${API_BASE}/companies/${id}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch company');
    return data;
  },

  createCompany: async (companyData) => {
    const res = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(companyData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create company');
    return data;
  },

  updateCompany: async (id, companyData) => {
    const res = await fetch(`${API_BASE}/companies/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(companyData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update company');
    return data;
  },

  deleteCompany: async (id) => {
    const res = await fetch(`${API_BASE}/companies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete company');
    return data;
  },

  // Employees
  getEmployees: async (companyId) => {
    const url = companyId ? `${API_BASE}/employees?companyId=${companyId}` : `${API_BASE}/employees`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch employees');
    return data;
  },

  getEmployeeById: async (id) => {
    const res = await fetch(`${API_BASE}/employees/${id}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch employee');
    return data;
  },

  createEmployee: async (employeeData) => {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create employee');
    return data;
  },

  updateEmployee: async (id, employeeData) => {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update employee');
    return data;
  },

  deleteEmployee: async (id) => {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete employee');
    return data;
  },

  bulkImportEmployees: async (companyId, employees) => {
    const res = await fetch(`${API_BASE}/employees/bulk-import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ companyId, employees }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to import employees');
    return data;
  },

  // Payslips
  prepareDraftPayslip: async (payload) => {
    const res = await fetch(`${API_BASE}/payslips/prepare-draft`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to prepare draft payslip');
    return data;
  },

  createPayslip: async (payslipData) => {
    const res = await fetch(`${API_BASE}/payslips`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payslipData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save payslip');
    return data;
  },

  generateBulkPayslips: async (bulkPayload) => {
    const res = await fetch(`${API_BASE}/payslips/bulk-generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bulkPayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to bulk generate payslips');
    return data;
  },

  getPayslips: async (filter = {}) => {
    const queryParams = new URLSearchParams(filter).toString();
    const url = queryParams ? `${API_BASE}/payslips?${queryParams}` : `${API_BASE}/payslips`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch payslips');
    return data;
  },

  getPayslipById: async (id) => {
    const res = await fetch(`${API_BASE}/payslips/${id}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch payslip details');
    return data;
  },

  updatePayslip: async (id, payslipData) => {
    const res = await fetch(`${API_BASE}/payslips/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payslipData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update salary slip');
    return data;
  },

  deletePayslip: async (id) => {
    const res = await fetch(`${API_BASE}/payslips/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete payslip');
    return data;
  },

  getBankAdviceReport: async (companyId, month, year) => {
    const res = await fetch(
      `${API_BASE}/payslips/reports/bank-advice?companyId=${companyId}&month=${month}&year=${year}`,
      { headers: getAuthHeaders() }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch bank advice report');
    return data;
  },

  getEpfEcrReport: async (companyId, month, year) => {
    const res = await fetch(
      `${API_BASE}/payslips/reports/epf-ecr?companyId=${companyId}&month=${month}&year=${year}`,
      { headers: getAuthHeaders() }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch EPF ECR report');
    return data;
  },

  // Tax Computations
  getComputations: async (filter = {}) => {
    const queryParams = new URLSearchParams(filter).toString();
    const url = queryParams ? `${API_BASE}/computations?${queryParams}` : `${API_BASE}/computations`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch computations');
    return data;
  },

  getComputationById: async (id) => {
    const res = await fetch(`${API_BASE}/computations/${id}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch computation details');
    return data;
  },

  createComputation: async (computationData) => {
    const res = await fetch(`${API_BASE}/computations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(computationData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create computation');
    return data;
  },

  updateComputation: async (id, computationData) => {
    const res = await fetch(`${API_BASE}/computations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(computationData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update computation');
    return data;
  },

  deleteComputation: async (id) => {
    const res = await fetch(`${API_BASE}/computations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete computation');
    return data;
  },

  aggregateSalaryForFY: async (employeeId, financialYear) => {
    const res = await fetch(
      `${API_BASE}/computations/aggregate-salary?employeeId=${employeeId}&financialYear=${financialYear}`,
      { headers: getAuthHeaders() }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to aggregate salary for FY');
    return data;
  },
};

