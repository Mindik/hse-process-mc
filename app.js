const STORAGE_KEY = "mk-procurement-prototype-v1";

function nowIso() {
  return new Date().toISOString();
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function dateOffset(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return formatIsoDate(date);
}

function timestampOffset(days, hours) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + (hours || 0));
  return date.toISOString();
}

function createSuppliers() {
  return [
    {
      id: 1,
      name: 'ООО "ТехСнаб Поволжье"',
      city: "Казань",
      inn: "1659012234",
      email: "sales@tehsnab-pv.ru",
      phone: "+7 (843) 210-44-19",
      leadTimeDays: 3,
      rating: 5,
      category: "Механика и оснастка",
    },
    {
      id: 2,
      name: 'АО "ПромЭлектроКомплект"',
      city: "Нижний Новгород",
      inn: "5260198451",
      email: "order@pek-group.ru",
      phone: "+7 (831) 260-11-58",
      leadTimeDays: 4,
      rating: 4,
      category: "Электротехника",
    },
    {
      id: 3,
      name: 'ООО "СпецХимПоставка"',
      city: "Самара",
      inn: "6317112350",
      email: "office@spec-chem.ru",
      phone: "+7 (846) 374-92-01",
      leadTimeDays: 2,
      rating: 4,
      category: "Химические материалы",
    },
    {
      id: 4,
      name: 'ООО "Логистик Трейд"',
      city: "Екатеринбург",
      inn: "6671124480",
      email: "supply@logtrade.ru",
      phone: "+7 (343) 378-55-00",
      leadTimeDays: 5,
      rating: 3,
      category: "Складское оборудование",
    },
  ];
}

function createProducts() {
  return [
    {
      id: 1001,
      supplierId: 1,
      name: "Насос центробежный НЦ-50",
      unit: "шт",
      price: 64000,
      stock: 12,
      sku: "NS-1001",
      category: "Оборудование",
    },
    {
      id: 1002,
      supplierId: 1,
      name: "Подшипник 6205 ZZ",
      unit: "шт",
      price: 780,
      stock: 450,
      sku: "NS-1002",
      category: "Комплектующие",
    },
    {
      id: 1003,
      supplierId: 1,
      name: "Манометр МП-100",
      unit: "шт",
      price: 2850,
      stock: 95,
      sku: "NS-1003",
      category: "КИП",
    },
    {
      id: 2001,
      supplierId: 2,
      name: "Кабель ВВГнг-LS 3x2.5",
      unit: "м",
      price: 185,
      stock: 2200,
      sku: "PEK-2001",
      category: "Кабельная продукция",
    },
    {
      id: 2002,
      supplierId: 2,
      name: "Щит распределительный ЩРН-36",
      unit: "шт",
      price: 14900,
      stock: 31,
      sku: "PEK-2002",
      category: "Щитовое оборудование",
    },
    {
      id: 2003,
      supplierId: 2,
      name: "Автоматический выключатель C32",
      unit: "шт",
      price: 950,
      stock: 140,
      sku: "PEK-2003",
      category: "Аппаратура",
    },
    {
      id: 3001,
      supplierId: 3,
      name: "Растворитель Р-646",
      unit: "л",
      price: 240,
      stock: 800,
      sku: "SCH-3001",
      category: "Расходные материалы",
    },
    {
      id: 3002,
      supplierId: 3,
      name: "Смазка индустриальная И-20",
      unit: "л",
      price: 310,
      stock: 950,
      sku: "SCH-3002",
      category: "Смазочные материалы",
    },
    {
      id: 3003,
      supplierId: 3,
      name: "Очиститель технический ОТ-5",
      unit: "л",
      price: 520,
      stock: 260,
      sku: "SCH-3003",
      category: "Химия",
    },
    {
      id: 4001,
      supplierId: 4,
      name: "Паллета пластиковая 1200x800",
      unit: "шт",
      price: 2200,
      stock: 160,
      sku: "LT-4001",
      category: "Склад",
    },
    {
      id: 4002,
      supplierId: 4,
      name: "Стеллаж усиленный 5 полок",
      unit: "шт",
      price: 9800,
      stock: 45,
      sku: "LT-4002",
      category: "Склад",
    },
    {
      id: 4003,
      supplierId: 4,
      name: "Тележка платформенная ТП-300",
      unit: "шт",
      price: 7600,
      stock: 22,
      sku: "LT-4003",
      category: "Склад",
    },
  ];
}

function createRequests() {
  return [
    {
      id: "З-2026-001",
      department: "Цех мехобработки",
      initiator: "Ольга Сафронова",
      supplierId: 2,
      budgetLimit: 120000,
      plannedDeliveryDate: dateOffset(5),
      justification:
        "Необходимо пополнение электротехнических материалов для планового ремонта линии №2.",
      status: "need_fix",
      registrationNumber: null,
      orderNumber: null,
      invoice: null,
      paymentDate: null,
      expectedDeliveryDate: null,
      actualDeliveryDate: null,
      reminderCount: 0,
      reminders: [],
      validationErrors: [
        "Сумма заявки превышает лимит бюджета.",
        "Нужно уточнить объем закупки по кабелю.",
      ],
      items: [
        { productId: 2001, qty: 500, price: 185 },
        { productId: 2002, qty: 2, price: 14900 },
      ],
      history: [
        {
          at: timestampOffset(-2, -4),
          actor: "Подразделение-заказчик",
          action: "Создана заявка",
          note: "Черновик заполнен в ИС",
        },
        {
          at: timestampOffset(-2, -2),
          actor: "Подразделение-заказчик",
          action: "Заявка отправлена в ИС",
          note: "Передана на автоматическую проверку",
        },
        {
          at: timestampOffset(-2, -1),
          actor: "ИС",
          action: "Автопроверка: нужны исправления",
          note: "Вернуть на доработку",
        },
      ],
      createdAt: timestampOffset(-2, -4),
      updatedAt: timestampOffset(-2, -1),
    },
    {
      id: "З-2026-002",
      department: "Склад готовой продукции",
      initiator: "Николай Климов",
      supplierId: 1,
      budgetLimit: 250000,
      plannedDeliveryDate: dateOffset(-1),
      justification:
        "Требуется закупка насосного и измерительного оборудования для комплектации отгрузок.",
      status: "waiting_delivery",
      registrationNumber: "РГ-2026-0003",
      orderNumber: "ЗК-2026-0057",
      invoice: {
        number: "СЧ-TS-0412",
        date: dateOffset(-3),
        amount: 139400,
      },
      paymentDate: dateOffset(-2),
      expectedDeliveryDate: dateOffset(-1),
      actualDeliveryDate: null,
      reminderCount: 1,
      reminders: [
        { at: timestampOffset(-1, -2), text: "Автонапоминание поставщику №1" },
      ],
      validationErrors: [],
      items: [
        { productId: 1001, qty: 2, price: 64000 },
        { productId: 1003, qty: 4, price: 2850 },
      ],
      history: [
        {
          at: timestampOffset(-5, -3),
          actor: "Подразделение-заказчик",
          action: "Создана заявка",
          note: "",
        },
        {
          at: timestampOffset(-5, -1),
          actor: "ИС",
          action: "Заявка зарегистрирована",
          note: "РГ-2026-0003",
        },
        {
          at: timestampOffset(-4, -3),
          actor: "Отдел снабжения",
          action: "Заказ поставщику отправлен",
          note: "ЗК-2026-0057",
        },
        {
          at: timestampOffset(-3, -5),
          actor: "Поставщик",
          action: "Получен счёт",
          note: "СЧ-TS-0412",
        },
        {
          at: timestampOffset(-2, -3),
          actor: "Бухгалтерия",
          action: "Оплата проведена",
          note: "Платеж подтвержден",
        },
        {
          at: timestampOffset(-2, -2),
          actor: "ИС",
          action: "Отправлено уведомление об оплате",
          note: "Старт контроля срока поставки",
        },
        {
          at: timestampOffset(-1, -2),
          actor: "ИС",
          action: "Отправлено напоминание поставщику",
          note: "Срок поставки истекает",
        },
      ],
      createdAt: timestampOffset(-5, -3),
      updatedAt: timestampOffset(-1, -2),
    },
    {
      id: "З-2026-003",
      department: "Ремонтная служба",
      initiator: "Евгений Лебедев",
      supplierId: 3,
      budgetLimit: 98000,
      plannedDeliveryDate: dateOffset(-8),
      justification: "Закупка расходных материалов для регламентных работ цеха упаковки.",
      status: "completed",
      registrationNumber: "РГ-2026-0004",
      orderNumber: "ЗК-2026-0064",
      invoice: {
        number: "СЧ-SCH-118",
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
          actor: "Подразделение-заказчик",
          action: "Создана заявка",
          note: "",
        },
        {
          at: timestampOffset(-12, -2),
          actor: "ИС",
          action: "Заявка зарегистрирована",
          note: "РГ-2026-0004",
        },
        {
          at: timestampOffset(-11, -5),
          actor: "Отдел снабжения",
          action: "Заказ поставщику отправлен",
          note: "ЗК-2026-0064",
        },
        {
          at: timestampOffset(-10, -5),
          actor: "Поставщик",
          action: "Получен счёт",
          note: "СЧ-SCH-118",
        },
        {
          at: timestampOffset(-9, -4),
          actor: "Бухгалтерия",
          action: "Оплата проведена",
          note: "",
        },
        {
          at: timestampOffset(-9, -2),
          actor: "ИС",
          action: "Отправлено уведомление поставщику",
          note: "",
        },
        {
          at: timestampOffset(-8, -3),
          actor: "Склад",
          action: "Товар принят складом",
          note: "",
        },
        {
          at: timestampOffset(-8, -1),
          actor: "Склад",
          action: "Акт загружен в ИС",
          note: "АКТ-2026-014",
        },
        {
          at: timestampOffset(-7, -5),
          actor: "Отдел снабжения",
          action: "Заявка закрыта",
          note: "Комплект документов проверен",
        },
        {
          at: timestampOffset(-7, -2),
          actor: "Подразделение-заказчик",
          action: "Товар получен со склада",
          note: "Процесс завершен",
        },
      ],
      createdAt: timestampOffset(-12, -4),
      updatedAt: timestampOffset(-7, -2),
    },
  ];
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function emptyFormState() {
  return {
    department: "",
    initiator: "",
    supplierId: null,
    budgetLimit: 0,
    plannedDeliveryDate: dateOffset(4),
    justification: "",
    items: [{ productId: null, qty: 1 }],
  };
}

const app = Vue.createApp({
  data() {
    return {
      activeTab: "process",
      currentRole: "requester",
      roleOptions: [
        { label: "Подразделение-заказчик", value: "requester" },
        { label: "Отдел снабжения", value: "supply" },
        { label: "Бухгалтерия", value: "accounting" },
        { label: "Склад", value: "warehouse" },
        { label: "ИС (автодействия)", value: "system" },
      ],
      statusMeta: {
        draft: { label: "Черновик", color: "grey-7" },
        submitted: { label: "На автопроверке ИС", color: "indigo-7" },
        need_fix: { label: "Требует исправления", color: "negative" },
        registered: { label: "Зарегистрирована", color: "primary" },
        order_sent: { label: "Заказ отправлен поставщику", color: "deep-orange-7" },
        invoice_received: { label: "Счёт получен", color: "brown-7" },
        paid: { label: "Счёт оплачен", color: "teal-7" },
        waiting_delivery: { label: "Контроль срока поставки", color: "orange-7" },
        warehouse_received: { label: "Товар принят складом", color: "cyan-7" },
        act_uploaded: { label: "Акт загружен в ИС", color: "blue-grey-7" },
        closed: { label: "Закупка закрыта", color: "positive" },
        completed: { label: "Товар выдан заказчику", color: "green-8" },
      },
      processSteps: [
        { code: "create", index: 1, title: "Заполнение заявки в ИС", role: "Подразделение-заказчик" },
        { code: "check", index: 2, title: "Автопроверка корректности", role: "ИС" },
        { code: "register", index: 3, title: "Регистрация заявки", role: "ИС" },
        { code: "order", index: 4, title: "Формирование и отправка заказа", role: "Отдел снабжения" },
        { code: "invoice", index: 5, title: "Получение счёта", role: "Поставщик / снабжение" },
        { code: "payment", index: 6, title: "Оплата и уведомление", role: "Бухгалтерия / ИС" },
        { code: "control", index: 7, title: "Контроль срока и напоминания", role: "ИС / снабжение" },
        { code: "warehouse", index: 8, title: "Приемка товара", role: "Склад" },
        { code: "act", index: 9, title: "Загрузка акта в ИС", role: "Склад" },
        { code: "close", index: 10, title: "Проверка документов и закрытие", role: "Отдел снабжения" },
        { code: "handover", index: 11, title: "Выдача товара заказчику", role: "Подразделение-заказчик" },
      ],
      statusToStep: {
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
        closed: 10,
        completed: 11,
      },
      requestColumns: [
        { name: "id", label: "Заявка", field: "id", align: "left", sortable: true },
        { name: "department", label: "Подразделение", field: "department", align: "left", sortable: true },
        { name: "supplier", label: "Поставщик", field: "supplier", align: "left" },
        { name: "status", label: "Статус", field: "status", align: "left" },
        { name: "total", label: "Сумма", field: "total", align: "right" },
        { name: "plannedDeliveryDate", label: "Поставка", field: "plannedDeliveryDate", align: "left", sortable: true },
      ],
      supplierColumns: [
        { name: "name", label: "Поставщик", field: "name", align: "left", sortable: true },
        { name: "city", label: "Город", field: "city", align: "left", sortable: true },
        { name: "category", label: "Категория", field: "category", align: "left" },
        { name: "leadTimeDays", label: "Срок поставки, дн", field: "leadTimeDays", align: "right", sortable: true },
        { name: "rating", label: "Рейтинг", field: "rating", align: "center" },
        { name: "email", label: "Email", field: "email", align: "left" },
      ],
      productColumns: [
        { name: "name", label: "Товар", field: "name", align: "left", sortable: true },
        { name: "supplier", label: "Поставщик", field: "supplier", align: "left" },
        { name: "category", label: "Категория", field: "category", align: "left" },
        { name: "sku", label: "Артикул", field: "sku", align: "left" },
        { name: "price", label: "Цена", field: "price", align: "right", sortable: true },
        { name: "stock", label: "Остаток", field: "stock", align: "right", sortable: true },
      ],
      suppliers: [],
      products: [],
      requests: [],
      selectedRequestId: null,
      requestSearch: "",
      statusFilter: "all",
      supplierSearch: "",
      productSearch: "",
      productSupplierFilter: "all",
      requestDialog: {
        open: false,
        isEdit: false,
        requestId: null,
      },
      form: emptyFormState(),
    };
  },

  computed: {
    statusOptions() {
      const base = [{ label: "Все статусы", value: "all" }];
      const statuses = Object.keys(this.statusMeta).map((key) => ({
        label: this.statusMeta[key].label,
        value: key,
      }));
      return base.concat(statuses);
    },

    supplierOptions() {
      return this.suppliers.map((supplier) => ({
        label: supplier.name,
        value: supplier.id,
      }));
    },

    formProductOptions() {
      return this.products
        .filter((item) => (this.form.supplierId ? item.supplierId === this.form.supplierId : true))
        .map((item) => ({
          label: `${item.name} (${this.formatMoney(item.price)} / ${item.unit})`,
          value: item.id,
        }));
    },

    formTotal() {
      return this.form.items.reduce((sum, item) => {
        const product = this.productById(item.productId);
        const qty = Number(item.qty) || 0;
        return sum + (product ? product.price * qty : 0);
      }, 0);
    },

    filteredRequests() {
      const search = this.requestSearch.toLowerCase();
      return this.requests
        .filter((row) => (this.statusFilter === "all" ? true : row.status === this.statusFilter))
        .filter((row) => {
          if (!search) {
            return true;
          }
          const inId = row.id.toLowerCase().includes(search);
          const inDepartment = row.department.toLowerCase().includes(search);
          const inSupplier = this.supplierName(row.supplierId).toLowerCase().includes(search);
          return inId || inDepartment || inSupplier;
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    },

    filteredSuppliers() {
      const search = this.supplierSearch.toLowerCase();
      return this.suppliers.filter((supplier) => {
        if (!search) {
          return true;
        }
        return (
          supplier.name.toLowerCase().includes(search) ||
          supplier.city.toLowerCase().includes(search) ||
          supplier.category.toLowerCase().includes(search)
        );
      });
    },

    productSupplierOptions() {
      return [{ label: "Все поставщики", value: "all" }].concat(
        this.suppliers.map((supplier) => ({ label: supplier.name, value: supplier.id }))
      );
    },

    filteredProducts() {
      const search = this.productSearch.toLowerCase();
      return this.products
        .filter((row) => (this.productSupplierFilter === "all" ? true : row.supplierId === this.productSupplierFilter))
        .filter((row) => {
          if (!search) {
            return true;
          }
          return (
            row.name.toLowerCase().includes(search) ||
            row.sku.toLowerCase().includes(search) ||
            row.category.toLowerCase().includes(search) ||
            this.supplierName(row.supplierId).toLowerCase().includes(search)
          );
        });
    },

    selectedRequest() {
      return this.requests.find((row) => row.id === this.selectedRequestId) || null;
    },

    selectedRequestLines() {
      if (!this.selectedRequest) {
        return [];
      }
      return this.selectedRequest.items.map((item) => {
        const product = this.productById(item.productId);
        return {
          productId: item.productId,
          name: product ? product.name : "Неизвестный товар",
          unit: product ? product.unit : "шт",
          qty: item.qty,
          price: item.price,
        };
      });
    },

    selectedHistory() {
      if (!this.selectedRequest) {
        return [];
      }
      return clone(this.selectedRequest.history).sort((a, b) => new Date(b.at) - new Date(a.at));
    },

    dashboardCards() {
      const total = this.requests.length;
      const completed = this.requests.filter((row) => row.status === "completed").length;
      const onControl = this.requests.filter((row) => row.status === "waiting_delivery").length;
      const overdue = this.requests.filter((row) => row.status === "waiting_delivery" && this.isOverdue(row)).length;
      return [
        { key: "total", label: "Всего заявок", value: total, caption: "в реестре прототипа" },
        { key: "completed", label: "Завершено", value: completed, caption: "закрыто и выдано заказчику" },
        { key: "control", label: "На контроле поставки", value: onControl, caption: "ожидание факта поставки" },
        { key: "overdue", label: "Просрочка", value: overdue, caption: "требуется напоминание поставщику" },
      ];
    },
  },

  methods: {
    emptyForm() {
      return emptyFormState();
    },

    initData() {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.requests) && Array.isArray(parsed.suppliers) && Array.isArray(parsed.products)) {
            this.requests = parsed.requests;
            this.suppliers = parsed.suppliers;
            this.products = parsed.products;
            this.selectedRequestId = parsed.selectedRequestId || (this.requests[0] ? this.requests[0].id : null);
            return;
          }
        } catch (error) {
          console.warn("Не удалось прочитать localStorage, загружены демо-данные", error);
        }
      }
      this.suppliers = createSuppliers();
      this.products = createProducts();
      this.requests = createRequests();
      this.selectedRequestId = this.requests[0] ? this.requests[0].id : null;
      this.persistState();
    },

    persistState() {
      const payload = {
        suppliers: this.suppliers,
        products: this.products,
        requests: this.requests,
        selectedRequestId: this.selectedRequestId,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    },

    resetDemoData() {
      this.$q
        .dialog({
          title: "Сброс данных",
          message: "Восстановить исходные моковые данные и очистить текущие изменения?",
          cancel: true,
          persistent: true,
          ok: { label: "Сбросить", color: "negative" },
          cancel: { label: "Отмена", flat: true },
        })
        .onOk(() => {
          this.suppliers = createSuppliers();
          this.products = createProducts();
          this.requests = createRequests();
          this.selectedRequestId = this.requests[0] ? this.requests[0].id : null;
          this.persistState();
          this.$q.notify({ type: "positive", message: "Демо-данные восстановлены." });
        });
    },

    supplierById(supplierId) {
      return this.suppliers.find((row) => row.id === supplierId) || null;
    },

    supplierName(supplierId) {
      const supplier = this.supplierById(supplierId);
      return supplier ? supplier.name : "Не выбран";
    },

    productById(productId) {
      return this.products.find((row) => row.id === productId) || null;
    },

    requestTotal(request) {
      return request.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    },

    formatMoney(value) {
      return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(
        Number(value || 0)
      );
    },

    formatDate(value) {
      if (!value) {
        return "—";
      }
      const date = new Date(value);
      return new Intl.DateTimeFormat("ru-RU", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
    },

    formatDateTime(value) {
      if (!value) {
        return "—";
      }
      const date = new Date(value);
      return new Intl.DateTimeFormat("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },

    isOverdue(request) {
      if (!request.plannedDeliveryDate || request.status !== "waiting_delivery") {
        return false;
      }
      const today = formatIsoDate(new Date());
      return request.plannedDeliveryDate < today;
    },

    deliveryHint(request) {
      if (!request.plannedDeliveryDate) {
        return "дата не задана";
      }
      if (request.status !== "waiting_delivery") {
        return "по графику процесса";
      }
      if (this.isOverdue(request)) {
        return "срок истек";
      }
      return "в контроле";
    },

    onRequestRowClick(_evt, row) {
      this.selectedRequestId = row.id;
      this.persistState();
    },

    openCreateDialog() {
      this.requestDialog.open = true;
      this.requestDialog.isEdit = false;
      this.requestDialog.requestId = null;
      this.form = this.emptyForm();
    },

    openEditDialog(request) {
      this.requestDialog.open = true;
      this.requestDialog.isEdit = true;
      this.requestDialog.requestId = request.id;
      this.form = {
        department: request.department,
        initiator: request.initiator,
        supplierId: request.supplierId,
        budgetLimit: request.budgetLimit,
        plannedDeliveryDate: request.plannedDeliveryDate,
        justification: request.justification,
        items: request.items.map((item) => ({ productId: item.productId, qty: item.qty })),
      };
      if (!this.form.items.length) {
        this.form.items = [{ productId: null, qty: 1 }];
      }
    },

    addFormItem() {
      this.form.items.push({ productId: null, qty: 1 });
    },

    removeFormItem(index) {
      if (this.form.items.length === 1) {
        return;
      }
      this.form.items.splice(index, 1);
    },

    formItemAmount(item) {
      const product = this.productById(item.productId);
      const qty = Number(item.qty) || 0;
      return product ? product.price * qty : 0;
    },

    normalizeFormItems() {
      return this.form.items
        .filter((item) => item.productId)
        .map((item) => {
          const product = this.productById(item.productId);
          return {
            productId: item.productId,
            qty: Number(item.qty) || 0,
            price: product ? product.price : 0,
          };
        });
    },

    generateRequestId() {
      const year = new Date().getFullYear();
      const maxNum = this.requests.reduce((max, row) => {
        const parts = row.id.split("-");
        const number = Number(parts[parts.length - 1]);
        return Number.isNaN(number) ? max : Math.max(max, number);
      }, 0);
      return `З-${year}-${String(maxNum + 1).padStart(3, "0")}`;
    },

    saveRequestFromDialog() {
      const items = this.normalizeFormItems();
      if (!this.form.department || !this.form.initiator || !this.form.supplierId) {
        this.$q.notify({ type: "negative", message: "Заполните обязательные поля заявки." });
        return;
      }
      if (!this.form.justification || this.form.justification.length < 10) {
        this.$q.notify({ type: "negative", message: "Добавьте развернутое обоснование (минимум 10 символов)." });
        return;
      }
      if (!this.form.plannedDeliveryDate || !this.form.budgetLimit || Number(this.form.budgetLimit) <= 0) {
        this.$q.notify({ type: "negative", message: "Укажите плановую дату поставки и бюджет." });
        return;
      }
      if (!items.length || items.some((item) => item.qty <= 0)) {
        this.$q.notify({ type: "negative", message: "Проверьте позиции: товар и количество должны быть заполнены." });
        return;
      }

      if (this.requestDialog.isEdit) {
        const request = this.requests.find((row) => row.id === this.requestDialog.requestId);
        if (!request) {
          this.$q.notify({ type: "negative", message: "Заявка для редактирования не найдена." });
          return;
        }
        request.department = this.form.department;
        request.initiator = this.form.initiator;
        request.supplierId = this.form.supplierId;
        request.budgetLimit = Number(this.form.budgetLimit);
        request.plannedDeliveryDate = this.form.plannedDeliveryDate;
        request.justification = this.form.justification;
        request.items = items;
        this.logEvent(request, "Подразделение-заказчик", "Исправлены данные заявки", "Данные обновлены в форме");
        this.selectedRequestId = request.id;
      } else {
        const request = {
          id: this.generateRequestId(),
          department: this.form.department,
          initiator: this.form.initiator,
          supplierId: this.form.supplierId,
          budgetLimit: Number(this.form.budgetLimit),
          plannedDeliveryDate: this.form.plannedDeliveryDate,
          justification: this.form.justification,
          status: "draft",
          registrationNumber: null,
          orderNumber: null,
          invoice: null,
          paymentDate: null,
          expectedDeliveryDate: null,
          actualDeliveryDate: null,
          reminderCount: 0,
          reminders: [],
          validationErrors: [],
          items,
          history: [],
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        this.logEvent(request, "Подразделение-заказчик", "Создана заявка", "Черновик в ИС");
        this.requests.unshift(request);
        this.selectedRequestId = request.id;
      }

      this.persistState();
      this.requestDialog.open = false;
      this.$q.notify({ type: "positive", message: "Заявка сохранена." });
    },

    availableActions(request) {
      if (!request) {
        return [];
      }
      const actionsByStatus = {
        draft: ["edit", "submit", "autoComplete"],
        need_fix: ["edit", "submit", "autoComplete"],
        submitted: ["runCheck", "autoComplete"],
        registered: ["sendOrder", "autoComplete"],
        order_sent: ["receiveInvoice", "autoComplete"],
        invoice_received: ["payInvoice", "autoComplete"],
        paid: ["notifySupplier", "autoComplete"],
        waiting_delivery: ["sendReminder", "supplierReply", "receiveGoods", "autoComplete"],
        warehouse_received: ["uploadAct", "autoComplete"],
        act_uploaded: ["closeRequest", "autoComplete"],
        closed: ["handover", "autoComplete"],
        completed: [],
      };

      const actionMeta = {
        edit: {
          key: "edit",
          label: "Исправить заявку",
          icon: "edit",
          color: "blue-8",
          roles: ["requester"],
        },
        submit: {
          key: "submit",
          label: "Отправить в ИС",
          icon: "send",
          color: "primary",
          roles: ["requester"],
        },
        runCheck: {
          key: "runCheck",
          label: "Запустить автопроверку",
          icon: "task_alt",
          color: "indigo-8",
          roles: ["system"],
        },
        sendOrder: {
          key: "sendOrder",
          label: "Отправить заказ поставщику",
          icon: "send",
          color: "deep-orange-8",
          roles: ["supply"],
        },
        receiveInvoice: {
          key: "receiveInvoice",
          label: "Зарегистрировать счёт",
          icon: "receipt_long",
          color: "brown-7",
          roles: ["supply"],
        },
        payInvoice: {
          key: "payInvoice",
          label: "Провести оплату",
          icon: "paid",
          color: "teal-7",
          roles: ["accounting"],
        },
        notifySupplier: {
          key: "notifySupplier",
          label: "Уведомить поставщика об оплате",
          icon: "notifications_active",
          color: "cyan-8",
          roles: ["system"],
        },
        sendReminder: {
          key: "sendReminder",
          label: "Отправить напоминание",
          icon: "notification_important",
          color: "orange-8",
          roles: ["system", "supply"],
        },
        supplierReply: {
          key: "supplierReply",
          label: "Зафиксировать ответ поставщика",
          icon: "support_agent",
          color: "grey-8",
          roles: ["supply"],
        },
        receiveGoods: {
          key: "receiveGoods",
          label: "Принять товар на склад",
          icon: "inventory",
          color: "cyan-7",
          roles: ["warehouse"],
        },
        uploadAct: {
          key: "uploadAct",
          label: "Загрузить акт в ИС",
          icon: "upload_file",
          color: "blue-grey-7",
          roles: ["warehouse"],
        },
        closeRequest: {
          key: "closeRequest",
          label: "Закрыть заявку",
          icon: "fact_check",
          color: "positive",
          roles: ["supply"],
        },
        handover: {
          key: "handover",
          label: "Выдать товар заказчику",
          icon: "move_to_inbox",
          color: "green-8",
          roles: ["requester"],
        },
        autoComplete: {
          key: "autoComplete",
          label: "Автопрогон до завершения",
          icon: "smart_toy",
          color: "accent",
          roles: ["requester", "supply", "accounting", "warehouse", "system"],
        },
      };

      const actionKeys = actionsByStatus[request.status] || [];
      return actionKeys.map((key) => {
        const meta = actionMeta[key];
        const allowed = meta.roles.includes(this.currentRole);
        return {
          key: meta.key,
          label: meta.label,
          icon: meta.icon,
          color: meta.color,
          disabled: !allowed,
          disabledReason: !allowed
            ? `Действие доступно для роли: ${meta.roles.map((role) => this.roleLabel(role)).join(", ")}`
            : "",
        };
      });
    },

    roleLabel(roleCode) {
      const role = this.roleOptions.find((row) => row.value === roleCode);
      return role ? role.label : roleCode;
    },

    runAction(actionKey, request) {
      if (!request) {
        return;
      }
      if (actionKey === "edit") {
        this.openEditDialog(request);
        return;
      }
      if (actionKey === "submit") {
        this.submitRequest(request);
        return;
      }
      if (actionKey === "runCheck") {
        this.runAutoCheck(request);
        return;
      }
      if (actionKey === "sendOrder") {
        this.sendOrder(request);
        return;
      }
      if (actionKey === "receiveInvoice") {
        this.receiveInvoice(request);
        return;
      }
      if (actionKey === "payInvoice") {
        this.payInvoice(request);
        return;
      }
      if (actionKey === "notifySupplier") {
        this.notifySupplier(request);
        return;
      }
      if (actionKey === "sendReminder") {
        this.sendReminder(request);
        return;
      }
      if (actionKey === "supplierReply") {
        this.captureSupplierReply(request);
        return;
      }
      if (actionKey === "receiveGoods") {
        this.receiveGoods(request);
        return;
      }
      if (actionKey === "uploadAct") {
        this.uploadAct(request);
        return;
      }
      if (actionKey === "closeRequest") {
        this.closeRequest(request);
        return;
      }
      if (actionKey === "handover") {
        this.handover(request);
        return;
      }
      if (actionKey === "autoComplete") {
        this.autoComplete(request);
      }
    },

    logEvent(request, actor, action, note, nextStatus) {
      if (nextStatus) {
        request.status = nextStatus;
      }
      request.updatedAt = nowIso();
      request.history.push({
        at: nowIso(),
        actor,
        action,
        note: note || "",
      });
    },

    validateRequest(request) {
      const errors = [];
      if (!request.department) {
        errors.push("Не указано подразделение-заказчик.");
      }
      if (!request.initiator) {
        errors.push("Не указан инициатор заявки.");
      }
      if (!request.supplierId) {
        errors.push("Не выбран поставщик.");
      }
      if (!request.justification || request.justification.length < 10) {
        errors.push("Обоснование закупки заполнено неполно.");
      }
      if (!request.plannedDeliveryDate) {
        errors.push("Не задана плановая дата поставки.");
      }
      if (!request.items.length) {
        errors.push("В заявке нет ни одной позиции.");
      }

      request.items.forEach((item) => {
        const product = this.productById(item.productId);
        if (!product) {
          errors.push("Обнаружена позиция с несуществующим товаром.");
          return;
        }
        if (item.qty <= 0) {
          errors.push(`Позиция "${product.name}": количество должно быть больше нуля.`);
        }
      });

      const total = this.requestTotal(request);
      if (total > request.budgetLimit) {
        errors.push(`Сумма ${this.formatMoney(total)} превышает бюджет ${this.formatMoney(request.budgetLimit)}.`);
      }
      return errors;
    },

    submitRequest(request, options) {
      if (!(request.status === "draft" || request.status === "need_fix")) {
        return;
      }
      request.validationErrors = [];
      this.logEvent(request, "Подразделение-заказчик", "Заявка отправлена в ИС", "Передана на автопроверку", "submitted");
      this.persistState();
      if (!(options && options.silent)) {
        this.$q.notify({ type: "positive", message: "Заявка отправлена на автопроверку." });
      }
    },

    runAutoCheck(request, options) {
      if (request.status !== "submitted") {
        return;
      }
      const errors = this.validateRequest(request);
      if (errors.length) {
        request.validationErrors = errors;
        this.logEvent(request, "ИС", "Автопроверка: нужны исправления", "Возврат заявки на доработку", "need_fix");
        this.persistState();
        if (!(options && options.silent)) {
          this.$q.notify({ type: "warning", message: "Проверка не пройдена. Исправьте заявку." });
        }
        return;
      }
      request.validationErrors = [];
      if (!request.registrationNumber) {
        request.registrationNumber = this.generateRegistrationNumber();
      }
      this.logEvent(
        request,
        "ИС",
        "Заявка зарегистрирована",
        `Регистрационный номер: ${request.registrationNumber}`,
        "registered"
      );
      this.persistState();
      if (!(options && options.silent)) {
        this.$q.notify({ type: "positive", message: "Автопроверка успешна. Заявка зарегистрирована." });
      }
    },

    generateRegistrationNumber() {
      const year = new Date().getFullYear();
      const count = this.requests.filter((row) => row.registrationNumber).length + 1;
      return `РГ-${year}-${String(count).padStart(4, "0")}`;
    },

    generateOrderNumber() {
      const year = new Date().getFullYear();
      const count = this.requests.filter((row) => row.orderNumber).length + 1;
      return `ЗК-${year}-${String(count).padStart(4, "0")}`;
    },

    sendOrder(request, options) {
      if (request.status !== "registered") {
        return;
      }
      if (!request.orderNumber) {
        request.orderNumber = this.generateOrderNumber();
      }
      const supplier = this.supplierById(request.supplierId);
      request.expectedDeliveryDate = dateOffset(supplier ? supplier.leadTimeDays : 3);
      this.logEvent(request, "Отдел снабжения", "Заказ поставщику отправлен", request.orderNumber, "order_sent");
      this.persistState();
      if (!(options && options.silent)) {
        this.$q.notify({ type: "positive", message: "Заказ отправлен поставщику." });
      }
    },

    receiveInvoice(request, options) {
      if (request.status !== "order_sent") {
        return;
      }
      const supplier = this.supplierById(request.supplierId);
      const code = supplier ? supplier.name.replace(/[^A-Za-zА-Яа-я]/g, "").slice(0, 3).toUpperCase() : "SUP";
      request.invoice = {
        number: `СЧ-${code}-${Math.floor(100 + Math.random() * 900)}`,
        date: formatIsoDate(new Date()),
        amount: this.requestTotal(request),
      };
      this.logEvent(request, "Поставщик", "Получен счёт", request.invoice.number, "invoice_received");
      this.persistState();
      if (!(options && options.silent)) {
        this.$q.notify({ type: "positive", message: "Счёт зарегистрирован и передан в бухгалтерию." });
      }
    },

    payInvoice(request, options) {
      if (request.status !== "invoice_received") {
        return;
      }
      request.paymentDate = formatIsoDate(new Date());
      this.logEvent(request, "Бухгалтерия", "Оплата проведена", `Дата платежа: ${request.paymentDate}`, "paid");
      this.persistState();
      if (!(options && options.silent)) {
        this.$q.notify({ type: "positive", message: "Оплата проведена." });
      }
    },

    notifySupplier(request, options) {
      if (request.status !== "paid") {
        return;
      }
      this.logEvent(
        request,
        "ИС",
        "Отправлено уведомление поставщику",
        "Старт контроля срока поставки",
        "waiting_delivery"
      );
      this.persistState();
      if (!(options && options.silent)) {
        this.$q.notify({ type: "positive", message: "Поставщик уведомлен. Контроль срока поставки включен." });
      }
    },

    sendReminder(request, options) {
      if (request.status !== "waiting_delivery") {
        return;
      }
      request.reminderCount = (request.reminderCount || 0) + 1;
      const text = `Напоминание №${request.reminderCount} отправлено поставщику`;
      request.reminders.push({ at: nowIso(), text });
      this.logEvent(request, "ИС", "Отправлено напоминание поставщику", text);
      this.persistState();
      if (!(options && options.silent)) {
        this.$q.notify({ type: "warning", message: text });
      }
    },

    captureSupplierReply(request) {
      if (request.status !== "waiting_delivery") {
        return;
      }
      this.$q
        .dialog({
          title: "Ответ поставщика",
          prompt: {
            model: "Поставка подтверждена, отгрузка завтра.",
            type: "text",
          },
          cancel: true,
          persistent: true,
          ok: { label: "Сохранить", color: "primary" },
          cancel: { label: "Отмена", flat: true },
        })
        .onOk((reply) => {
          this.logEvent(request, "Отдел снабжения", "Зафиксирован ответ поставщика", reply);
          this.persistState();
          this.$q.notify({ type: "info", message: "Ответ поставщика сохранен." });
        });
    },

    receiveGoods(request, options) {
      if (request.status !== "waiting_delivery") {
        return;
      }
      request.actualDeliveryDate = formatIsoDate(new Date());
      this.logEvent(request, "Склад", "Товар принят складом", "Ожидается загрузка акта", "warehouse_received");
      this.persistState();
      if (!(options && options.silent)) {
        this.$q.notify({ type: "positive", message: "Товар принят складом." });
      }
    },

    uploadAct(request, options) {
      if (request.status !== "warehouse_received") {
        return;
      }
      const actNumber = `АКТ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      this.logEvent(request, "Склад", "Акт загружен в ИС", actNumber, "act_uploaded");
      this.persistState();
      if (!(options && options.silent)) {
        this.$q.notify({ type: "positive", message: "Акт загружен в ИС." });
      }
    },

    closeRequest(request, options) {
      if (request.status !== "act_uploaded") {
        return;
      }
      this.logEvent(
        request,
        "Отдел снабжения",
        "Комплект документов проверен",
        "Закупка закрыта в ИС",
        "closed"
      );
      this.persistState();
      if (!(options && options.silent)) {
        this.$q.notify({ type: "positive", message: "Заявка закрыта." });
      }
    },

    handover(request, options) {
      if (request.status !== "closed") {
        return;
      }
      this.logEvent(
        request,
        "Подразделение-заказчик",
        "Товар получен со склада",
        "Процесс завершен",
        "completed"
      );
      this.persistState();
      if (!(options && options.silent)) {
        this.$q.notify({ type: "positive", message: "Заявка завершена." });
      }
    },

    ensureRequestValidForAutoflow(request) {
      if (!request.department) {
        request.department = "Подразделение-заказчик";
      }
      if (!request.initiator) {
        request.initiator = "Инициатор";
      }
      if (!request.supplierId && this.suppliers.length) {
        request.supplierId = this.suppliers[0].id;
      }
      if (!request.plannedDeliveryDate) {
        request.plannedDeliveryDate = dateOffset(3);
      }
      if (!request.justification || request.justification.length < 10) {
        request.justification = "Автоматически дополнено для прохождения проверки.";
      }
      if (!Array.isArray(request.items) || !request.items.length) {
        const firstProduct = this.products.find((row) => row.supplierId === request.supplierId) || this.products[0];
        if (firstProduct) {
          request.items = [{ productId: firstProduct.id, qty: 1, price: firstProduct.price }];
        } else {
          request.items = [];
        }
      }
      request.items = request.items.map((item) => {
        const product = this.productById(item.productId);
        const qty = Number(item.qty) > 0 ? Number(item.qty) : 1;
        return {
          productId: item.productId,
          qty,
          price: product ? product.price : item.price,
        };
      });
      const total = this.requestTotal(request);
      if (!request.budgetLimit || request.budgetLimit < total) {
        request.budgetLimit = total + 15000;
      }
    },

    autoComplete(request) {
      let guard = 0;
      while (request.status !== "completed" && guard < 20) {
        guard += 1;
        if (request.status === "draft" || request.status === "need_fix") {
          this.ensureRequestValidForAutoflow(request);
          this.logEvent(
            request,
            "Подразделение-заказчик",
            "Автоисправление заявки",
            "Данные приведены к корректному формату"
          );
          this.submitRequest(request, { silent: true });
          continue;
        }
        if (request.status === "submitted") {
          this.runAutoCheck(request, { silent: true });
          continue;
        }
        if (request.status === "registered") {
          this.sendOrder(request, { silent: true });
          continue;
        }
        if (request.status === "order_sent") {
          this.receiveInvoice(request, { silent: true });
          continue;
        }
        if (request.status === "invoice_received") {
          this.payInvoice(request, { silent: true });
          continue;
        }
        if (request.status === "paid") {
          this.notifySupplier(request, { silent: true });
          continue;
        }
        if (request.status === "waiting_delivery") {
          if (this.isOverdue(request)) {
            this.sendReminder(request, { silent: true });
          }
          this.receiveGoods(request, { silent: true });
          continue;
        }
        if (request.status === "warehouse_received") {
          this.uploadAct(request, { silent: true });
          continue;
        }
        if (request.status === "act_uploaded") {
          this.closeRequest(request, { silent: true });
          continue;
        }
        if (request.status === "closed") {
          this.handover(request, { silent: true });
          continue;
        }
      }
      this.persistState();
      if (request.status === "completed") {
        this.$q.notify({ type: "positive", message: `Автопрогон завершен: ${request.id}` });
      } else {
        this.$q.notify({ type: "negative", message: "Автопрогон остановлен: проверьте данные заявки." });
      }
    },

    stepStateLabel(request, step) {
      const current = this.statusToStep[request.status] || 1;
      if (request.status === "need_fix" && step.code === "check") {
        return "Ошибка";
      }
      if (step.index < current) {
        return "Выполнено";
      }
      if (step.index === current) {
        return "Текущий";
      }
      return "Ожидается";
    },

    stepColor(request, step) {
      const current = this.statusToStep[request.status] || 1;
      if (request.status === "need_fix" && step.code === "check") {
        return "negative";
      }
      if (step.index < current) {
        return "positive";
      }
      if (step.index === current) {
        return "primary";
      }
      return "grey-6";
    },

    stepIcon(request, step) {
      const state = this.stepStateLabel(request, step);
      if (state === "Выполнено") {
        return "check_circle";
      }
      if (state === "Ошибка") {
        return "error";
      }
      if (state === "Текущий") {
        return "play_circle";
      }
      return "radio_button_unchecked";
    },
  },

  mounted() {
    this.initData();
  },
});

app.use(Quasar, {
  plugins: {
    Dialog: Quasar.Dialog,
    Notify: Quasar.Notify,
  },
  config: {
    brand: {
      primary: "#0F5964",
      secondary: "#F59A23",
      accent: "#2E7A72",
      dark: "#1E2A32",
      positive: "#2E8B57",
      negative: "#C0392B",
      info: "#2679B5",
      warning: "#C7771A",
    },
    notify: {
      position: "top-right",
      timeout: 1800,
    },
  },
});

if (Quasar.lang && Quasar.lang.ru) {
  Quasar.lang.set(Quasar.lang.ru);
}

app.mount("#q-app");
