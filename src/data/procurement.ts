export type UserRole = 'requester' | 'supply' | 'accounting' | 'warehouse' | 'system';

export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'need_fix'
  | 'registered'
  | 'order_sent'
  | 'invoice_received'
  | 'paid'
  | 'waiting_delivery'
  | 'warehouse_received'
  | 'act_uploaded'
  | 'closed'
  | 'completed';

export interface Supplier {
  id: number;
  name: string;
  city: string;
  inn: string;
  email: string;
  phone: string;
  leadTimeDays: number;
  rating: number;
  category: string;
}

export interface Product {
  id: number;
  supplierId: number;
  name: string;
  unit: string;
  price: number;
  stock: number;
  sku: string;
  category: string;
}

export interface RequestItem {
  productId: number;
  qty: number;
  price: number;
}

export interface RequestHistory {
  at: string;
  actor: string;
  action: string;
  note: string;
}

export interface RequestInvoice {
  number: string;
  date: string;
  amount: number;
}

export interface RequestReminder {
  at: string;
  text: string;
}

export interface ProcurementRequest {
  id: string;
  department: string;
  initiator: string;
  supplierId: number | null;
  budgetLimit: number;
  plannedDeliveryDate: string;
  justification: string;
  status: RequestStatus;
  registrationNumber: string | null;
  orderNumber: string | null;
  invoice: RequestInvoice | null;
  paymentDate: string | null;
  expectedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  reminderCount: number;
  reminders: RequestReminder[];
  validationErrors: string[];
  items: RequestItem[];
  history: RequestHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface ProcessStep {
  code: string;
  index: number;
  title: string;
  role: string;
}

export interface RequestFormItem {
  productId: number | null;
  qty: number;
}

export interface RequestFormState {
  department: string;
  initiator: string;
  supplierId: number | null;
  budgetLimit: number;
  plannedDeliveryDate: string;
  justification: string;
  items: RequestFormItem[];
}

export interface ProcurementState {
  suppliers: Supplier[];
  products: Product[];
  requests: ProcurementRequest[];
  selectedRequestId: string | null;
}

export const STATUS_META: Record<RequestStatus, { label: string; color: string }> = {
  draft: { label: 'Черновик', color: 'grey-7' },
  submitted: { label: 'На автопроверке ИС', color: 'indigo-7' },
  need_fix: { label: 'Требует исправления', color: 'negative' },
  registered: { label: 'Зарегистрирована', color: 'primary' },
  order_sent: { label: 'Заказ отправлен поставщику', color: 'deep-orange-7' },
  invoice_received: { label: 'Счет получен', color: 'brown-7' },
  paid: { label: 'Счет оплачен', color: 'teal-7' },
  waiting_delivery: { label: 'Контроль срока поставки', color: 'orange-7' },
  warehouse_received: { label: 'Товар принят складом', color: 'cyan-7' },
  act_uploaded: { label: 'Акт загружен в ИС', color: 'blue-grey-7' },
  closed: { label: 'Закупка закрыта', color: 'positive' },
  completed: { label: 'Товар выдан заказчику', color: 'green-8' },
};

export const PROCESS_STEPS: ProcessStep[] = [
  { code: 'create', index: 1, title: 'Заполнение заявки в ИС', role: 'Подразделение-заказчик' },
  { code: 'check', index: 2, title: 'Автопроверка корректности', role: 'ИС' },
  { code: 'register', index: 3, title: 'Регистрация заявки', role: 'ИС' },
  { code: 'order', index: 4, title: 'Формирование и отправка заказа', role: 'Отдел снабжения' },
  { code: 'invoice', index: 5, title: 'Получение счета', role: 'Поставщик / снабжение' },
  { code: 'payment', index: 6, title: 'Оплата и уведомление', role: 'Бухгалтерия / ИС' },
  { code: 'control', index: 7, title: 'Контроль срока и напоминания', role: 'ИС / снабжение' },
  { code: 'warehouse', index: 8, title: 'Приемка товара', role: 'Склад' },
  { code: 'act', index: 9, title: 'Загрузка акта в ИС', role: 'Склад' },
  { code: 'close', index: 10, title: 'Проверка документов и закрытие', role: 'Отдел снабжения' },
  { code: 'handover', index: 11, title: 'Выдача товара заказчику', role: 'Склад' },
];

export const STATUS_TO_STEP: Record<RequestStatus, number> = {
  draft: 1,
  submitted: 2,
  need_fix: 2,
  registered: 3,
  order_sent: 4,
  invoice_received: 5,
  paid: 6,
  waiting_delivery: 7,
  warehouse_received: 8,
  act_uploaded: 9,
  closed: 11,
  completed: 12,
};

export function nowIso(): string {
  return new Date().toISOString();
}

export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function dateOffset(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return formatIsoDate(date);
}

function timestampOffset(days: number, hours = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function emptyFormState(): RequestFormState {
  return {
    department: '',
    initiator: '',
    supplierId: null,
    budgetLimit: 0,
    plannedDeliveryDate: dateOffset(4),
    justification: '',
    items: [{ productId: null, qty: 1 }],
  };
}

export function createSuppliers(): Supplier[] {
  return [
    {
      id: 1,
      name: 'ООО "ТехСнаб Поволжье"',
      city: 'Казань',
      inn: '1659012234',
      email: 'sales@tehsnab-pv.ru',
      phone: '+7 (843) 210-44-19',
      leadTimeDays: 3,
      rating: 5,
      category: 'Механика и оснастка',
    },
    {
      id: 2,
      name: 'АО "ПромЭлектроКомплект"',
      city: 'Нижний Новгород',
      inn: '5260198451',
      email: 'order@pek-group.ru',
      phone: '+7 (831) 260-11-58',
      leadTimeDays: 4,
      rating: 4,
      category: 'Электротехника',
    },
    {
      id: 3,
      name: 'ООО "СпецХимПоставка"',
      city: 'Самара',
      inn: '6317112350',
      email: 'office@spec-chem.ru',
      phone: '+7 (846) 374-92-01',
      leadTimeDays: 2,
      rating: 4,
      category: 'Химические материалы',
    },
    {
      id: 4,
      name: 'ООО "Логистик Трейд"',
      city: 'Екатеринбург',
      inn: '6671124480',
      email: 'supply@logtrade.ru',
      phone: '+7 (343) 378-55-00',
      leadTimeDays: 5,
      rating: 3,
      category: 'Складское оборудование',
    },
  ];
}

export function createProducts(): Product[] {
  return [
    {
      id: 1001,
      supplierId: 1,
      name: 'Насос центробежный НЦ-50',
      unit: 'шт',
      price: 64000,
      stock: 12,
      sku: 'NS-1001',
      category: 'Оборудование',
    },
    {
      id: 1002,
      supplierId: 1,
      name: 'Подшипник 6205 ZZ',
      unit: 'шт',
      price: 780,
      stock: 450,
      sku: 'NS-1002',
      category: 'Комплектующие',
    },
    {
      id: 1003,
      supplierId: 1,
      name: 'Манометр МП-100',
      unit: 'шт',
      price: 2850,
      stock: 95,
      sku: 'NS-1003',
      category: 'КИП',
    },
    {
      id: 1004,
      supplierId: 1,
      name: 'Клапан запорный Ду25',
      unit: 'шт',
      price: 3650,
      stock: 84,
      sku: 'NS-1004',
      category: 'Арматура',
    },
    {
      id: 1005,
      supplierId: 1,
      name: 'Муфта соединительная МС-40',
      unit: 'шт',
      price: 590,
      stock: 320,
      sku: 'NS-1005',
      category: 'Комплектующие',
    },
    {
      id: 2001,
      supplierId: 2,
      name: 'Кабель ВВГнг-LS 3x2.5',
      unit: 'м',
      price: 185,
      stock: 2200,
      sku: 'PEK-2001',
      category: 'Кабельная продукция',
    },
    {
      id: 2002,
      supplierId: 2,
      name: 'Щит распределительный ЩРН-36',
      unit: 'шт',
      price: 14900,
      stock: 31,
      sku: 'PEK-2002',
      category: 'Щитовое оборудование',
    },
    {
      id: 2003,
      supplierId: 2,
      name: 'Автоматический выключатель C32',
      unit: 'шт',
      price: 950,
      stock: 140,
      sku: 'PEK-2003',
      category: 'Аппаратура',
    },
    {
      id: 2004,
      supplierId: 2,
      name: 'Контактор КМИ-25',
      unit: 'шт',
      price: 2140,
      stock: 78,
      sku: 'PEK-2004',
      category: 'Пусковая аппаратура',
    },
    {
      id: 2005,
      supplierId: 2,
      name: 'Реле промежуточное РП-21',
      unit: 'шт',
      price: 680,
      stock: 210,
      sku: 'PEK-2005',
      category: 'Релейная аппаратура',
    },
    {
      id: 3001,
      supplierId: 3,
      name: 'Растворитель Р-646',
      unit: 'л',
      price: 240,
      stock: 800,
      sku: 'SCH-3001',
      category: 'Расходные материалы',
    },
    {
      id: 3002,
      supplierId: 3,
      name: 'Смазка индустриальная И-20',
      unit: 'л',
      price: 310,
      stock: 950,
      sku: 'SCH-3002',
      category: 'Смазочные материалы',
    },
    {
      id: 3003,
      supplierId: 3,
      name: 'Очиститель технический ОТ-5',
      unit: 'л',
      price: 520,
      stock: 260,
      sku: 'SCH-3003',
      category: 'Химия',
    },
    {
      id: 3004,
      supplierId: 3,
      name: 'Паста антикоррозионная ПАК-2',
      unit: 'кг',
      price: 740,
      stock: 115,
      sku: 'SCH-3004',
      category: 'Защитные материалы',
    },
    {
      id: 3005,
      supplierId: 3,
      name: 'Герметик промышленный ГП-90',
      unit: 'кг',
      price: 860,
      stock: 72,
      sku: 'SCH-3005',
      category: 'Химия',
    },
    {
      id: 4001,
      supplierId: 4,
      name: 'Паллета пластиковая 1200x800',
      unit: 'шт',
      price: 2200,
      stock: 160,
      sku: 'LT-4001',
      category: 'Склад',
    },
    {
      id: 4002,
      supplierId: 4,
      name: 'Стеллаж усиленный 5 полок',
      unit: 'шт',
      price: 9800,
      stock: 45,
      sku: 'LT-4002',
      category: 'Склад',
    },
    {
      id: 4003,
      supplierId: 4,
      name: 'Тележка платформенная ТП-300',
      unit: 'шт',
      price: 7600,
      stock: 22,
      sku: 'LT-4003',
      category: 'Склад',
    },
    {
      id: 4004,
      supplierId: 4,
      name: 'Контейнер складской КС-600',
      unit: 'шт',
      price: 3150,
      stock: 93,
      sku: 'LT-4004',
      category: 'Склад',
    },
    {
      id: 4005,
      supplierId: 4,
      name: 'Лента сигнальная напольная 50мм',
      unit: 'рул',
      price: 430,
      stock: 180,
      sku: 'LT-4005',
      category: 'Маркировка',
    },
  ];
}

export function createRequests(): ProcurementRequest[] {
  return [
    {
      id: 'З-2026-001',
      department: 'Цех мехобработки',
      initiator: 'Ольга Сафронова',
      supplierId: 2,
      budgetLimit: 120000,
      plannedDeliveryDate: dateOffset(5),
      justification:
        'Необходимо пополнение электротехнических материалов для планового ремонта линии №2.',
      status: 'need_fix',
      registrationNumber: null,
      orderNumber: null,
      invoice: null,
      paymentDate: null,
      expectedDeliveryDate: null,
      actualDeliveryDate: null,
      reminderCount: 0,
      reminders: [],
      validationErrors: [
        'Сумма заявки превышает лимит бюджета.',
        'Нужно уточнить объем закупки по кабелю.',
      ],
      items: [
        { productId: 2001, qty: 500, price: 185 },
        { productId: 2002, qty: 2, price: 14900 },
      ],
      history: [
        {
          at: timestampOffset(-2, -4),
          actor: 'Подразделение-заказчик',
          action: 'Создана заявка',
          note: 'Черновик заполнен в ИС',
        },
        {
          at: timestampOffset(-2, -2),
          actor: 'Подразделение-заказчик',
          action: 'Заявка отправлена в ИС',
          note: 'Передана на автоматическую проверку',
        },
        {
          at: timestampOffset(-2, -1),
          actor: 'ИС',
          action: 'Автопроверка: нужны исправления',
          note: 'Вернуть на доработку',
        },
      ],
      createdAt: timestampOffset(-2, -4),
      updatedAt: timestampOffset(-2, -1),
    },
    {
      id: 'З-2026-002',
      department: 'Склад готовой продукции',
      initiator: 'Николай Климов',
      supplierId: 1,
      budgetLimit: 250000,
      plannedDeliveryDate: dateOffset(-1),
      justification:
        'Требуется закупка насосного и измерительного оборудования для комплектации отгрузок.',
      status: 'waiting_delivery',
      registrationNumber: 'РГ-2026-0003',
      orderNumber: 'ЗК-2026-0057',
      invoice: {
        number: 'СЧ-TS-0412',
        date: dateOffset(-3),
        amount: 139400,
      },
      paymentDate: dateOffset(-2),
      expectedDeliveryDate: dateOffset(-1),
      actualDeliveryDate: null,
      reminderCount: 1,
      reminders: [
        { at: timestampOffset(-1, -2), text: 'Автонапоминание поставщику №1' },
      ],
      validationErrors: [],
      items: [
        { productId: 1001, qty: 2, price: 64000 },
        { productId: 1003, qty: 4, price: 2850 },
      ],
      history: [
        {
          at: timestampOffset(-5, -3),
          actor: 'Подразделение-заказчик',
          action: 'Создана заявка',
          note: '',
        },
        {
          at: timestampOffset(-5, -1),
          actor: 'ИС',
          action: 'Заявка зарегистрирована',
          note: 'РГ-2026-0003',
        },
        {
          at: timestampOffset(-4, -3),
          actor: 'Отдел снабжения',
          action: 'Заказ поставщику отправлен',
          note: 'ЗК-2026-0057',
        },
        {
          at: timestampOffset(-3, -5),
          actor: 'Поставщик',
          action: 'Получен счет',
          note: 'СЧ-TS-0412',
        },
        {
          at: timestampOffset(-2, -3),
          actor: 'Бухгалтерия',
          action: 'Оплата проведена',
          note: 'Платеж подтвержден',
        },
        {
          at: timestampOffset(-2, -2),
          actor: 'ИС',
          action: 'Отправлено уведомление об оплате',
          note: 'Старт контроля срока поставки',
        },
        {
          at: timestampOffset(-1, -2),
          actor: 'ИС',
          action: 'Отправлено напоминание поставщику',
          note: 'Срок поставки истекает',
        },
      ],
      createdAt: timestampOffset(-5, -3),
      updatedAt: timestampOffset(-1, -2),
    },
    {
      id: 'З-2026-003',
      department: 'Ремонтная служба',
      initiator: 'Евгений Лебедев',
      supplierId: 3,
      budgetLimit: 98000,
      plannedDeliveryDate: dateOffset(-8),
      justification: 'Закупка расходных материалов для регламентных работ цеха упаковки.',
      status: 'completed',
      registrationNumber: 'РГ-2026-0004',
      orderNumber: 'ЗК-2026-0064',
      invoice: {
        number: 'СЧ-SCH-118',
        date: dateOffset(-10),
        amount: 56800,
      },
      paymentDate: dateOffset(-9),
      expectedDeliveryDate: dateOffset(-8),
      actualDeliveryDate: dateOffset(-8),
      reminderCount: 0,
      reminders: [],
      validationErrors: [],
      items: [
        { productId: 3001, qty: 120, price: 240 },
        { productId: 3002, qty: 90, price: 310 },
      ],
      history: [
        {
          at: timestampOffset(-12, -4),
          actor: 'Подразделение-заказчик',
          action: 'Создана заявка',
          note: '',
        },
        {
          at: timestampOffset(-12, -2),
          actor: 'ИС',
          action: 'Заявка зарегистрирована',
          note: 'РГ-2026-0004',
        },
        {
          at: timestampOffset(-11, -5),
          actor: 'Отдел снабжения',
          action: 'Заказ поставщику отправлен',
          note: 'ЗК-2026-0064',
        },
        {
          at: timestampOffset(-10, -5),
          actor: 'Поставщик',
          action: 'Получен счет',
          note: 'СЧ-SCH-118',
        },
        {
          at: timestampOffset(-9, -4),
          actor: 'Бухгалтерия',
          action: 'Оплата проведена',
          note: '',
        },
        {
          at: timestampOffset(-9, -2),
          actor: 'ИС',
          action: 'Отправлено уведомление поставщику',
          note: '',
        },
        {
          at: timestampOffset(-8, -3),
          actor: 'Склад',
          action: 'Товар принят складом',
          note: '',
        },
        {
          at: timestampOffset(-8, -1),
          actor: 'Склад',
          action: 'Акт загружен в ИС',
          note: 'АКТ-2026-014',
        },
        {
          at: timestampOffset(-7, -5),
          actor: 'Отдел снабжения',
          action: 'Заявка закрыта',
          note: 'Комплект документов проверен',
        },
        {
          at: timestampOffset(-7, -2),
          actor: 'Подразделение-заказчик',
          action: 'Товар получен со склада',
          note: 'Процесс завершен',
        },
      ],
      createdAt: timestampOffset(-12, -4),
      updatedAt: timestampOffset(-7, -2),
    },
  ];
}

export function createDemoState(): ProcurementState {
  const requests = createRequests();
  return {
    suppliers: createSuppliers(),
    products: createProducts(),
    requests,
    selectedRequestId: requests[0]?.id ?? null,
  };
}
