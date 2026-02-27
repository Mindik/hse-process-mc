<template>
  <q-page class="q-pa-md app-bg">
    <q-card class="header-shell header-sticky q-mb-md">
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="col-12 col-lg-7">
          <div class="text-h5 text-weight-bold text-white">Прототип ИС закупок</div>
          <div class="text-caption header-caption">
            To-Be процесс: заявка -> проверка -> заказ -> оплата -> поставка -> закрытие
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <q-select
            v-model="currentRole"
            dense
            outlined
            bg-color="white"
            emit-value
            map-options
            :options="roleOptions"
            label="Текущая роль"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-2 text-right">
          <q-btn
            flat
            color="white"
            icon="restart_alt"
            label="Сбросить демо-данные"
            @click="resetDemoData"
          />
        </div>
      </q-card-section>
      <q-tabs
        v-model="activeTab"
        dense
        align="left"
        active-color="secondary"
        indicator-color="secondary"
        class="q-px-sm"
      >
        <q-tab name="process" label="Процесс и заявки" icon="account_tree" />
        <q-tab name="suppliers" label="Поставщики" icon="domain" />
        <q-tab name="products" label="Товары" icon="inventory_2" />
        <q-tab name="guide" label="To-Be карта" icon="map" />
      </q-tabs>
    </q-card>

    <div v-if="activeTab === 'process'" class="fade-in">
      <div class="row q-col-gutter-md q-mb-md">
        <div v-for="card in dashboardCards" :key="card.key" class="col-12 col-sm-6 col-lg-3">
          <q-card class="stat-card">
            <q-card-section>
              <div class="text-caption">{{ card.label }}</div>
              <div class="text-h4 text-weight-bold">{{ card.value }}</div>
              <div class="text-caption text-grey-7">{{ card.caption }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-xl-5">
          <q-card class="panel-card">
            <q-card-section class="row q-col-gutter-sm items-center">
              <div class="col-12 col-md-5">
                <q-input
                  v-model.trim="requestSearch"
                  dense
                  outlined
                  label="Поиск заявки"
                  clearable
                  debounce="200"
                >
                  <template #prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="statusFilter"
                  dense
                  outlined
                  emit-value
                  map-options
                  :options="statusOptions"
                  label="Статус"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-btn
                  color="primary"
                  icon="add"
                  class="full-width"
                  label="Новая заявка"
                  @click="openCreateDialog"
                />
              </div>
            </q-card-section>
            <q-separator />
            <q-table
              flat
              dense
              row-key="id"
              :rows="filteredRequests"
              :columns="requestColumns"
              :pagination="{ rowsPerPage: 6 }"
              :rows-per-page-options="[6, 12, 24]"
              @row-click="onRequestRowClick"
            >
              <template #body-cell-status="props">
                <q-td :props="props">
                  <q-chip dense :color="statusColor(props.row.status as RequestStatus)" text-color="white">
                    {{ statusLabel(props.row.status as RequestStatus) }}
                  </q-chip>
                </q-td>
              </template>
              <template #body-cell-supplier="props">
                <q-td :props="props">
                  {{ supplierName(props.row.supplierId) }}
                </q-td>
              </template>
              <template #body-cell-total="props">
                <q-td :props="props">
                  {{ formatMoney(requestTotal(props.row)) }}
                </q-td>
              </template>
              <template #body-cell-plannedDeliveryDate="props">
                <q-td :props="props">
                  <div>{{ formatDate(props.row.plannedDeliveryDate) }}</div>
                  <div class="text-caption" :class="isOverdue(props.row) ? 'text-negative' : 'text-grey-6'">
                    {{ deliveryHint(props.row) }}
                  </div>
                </q-td>
              </template>
              <template #no-data>
                <div class="q-pa-md text-grey-7">Заявки не найдены.</div>
              </template>
            </q-table>
          </q-card>
        </div>

        <div class="col-12 col-xl-7">
          <q-card v-if="selectedRequest" class="panel-card">
            <q-card-section class="row items-start q-col-gutter-md">
              <div class="col-12 col-lg-8">
                <div class="text-h6">{{ selectedRequest.id }}</div>
                <div class="text-caption text-grey-7">
                  Подразделение: {{ selectedRequest.department }} | Инициатор: {{ selectedRequest.initiator }}
                </div>
                <div class="text-caption text-grey-7">
                  Поставщик: {{ supplierName(selectedRequest.supplierId) }}
                </div>
                <div class="text-caption text-grey-7">
                  Плановая дата поставки: {{ formatDate(selectedRequest.plannedDeliveryDate) }}
                </div>
              </div>
              <div class="col-12 col-lg-4 text-right">
                <q-chip :color="statusMeta[selectedRequest.status].color" text-color="white">
                  {{ statusMeta[selectedRequest.status].label }}
                </q-chip>
                <div class="text-subtitle2 q-mt-sm">
                  Сумма: {{ formatMoney(requestTotal(selectedRequest)) }}
                </div>
                <div class="text-caption text-grey-6">Обновлено: {{ formatDateTime(selectedRequest.updatedAt) }}</div>
              </div>
            </q-card-section>

            <q-separator />
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">Доступные действия</div>
              <q-banner dense rounded class="bg-blue-1 text-primary q-mb-sm">
                <div class="text-subtitle2">{{ stageGuidance.title }}</div>
                <div class="q-mt-xs">
                  <q-chip dense color="primary" text-color="white">
                    {{ stageGuidance.roleLabel }}
                  </q-chip>
                  <span class="q-ml-sm">{{ stageGuidance.text }}</span>
                </div>
              </q-banner>
              <div class="q-gutter-sm">
                <q-btn
                  v-for="action in selectedAvailableActions"
                  :key="action.key"
                  :label="action.label"
                  :icon="action.icon"
                  :color="action.color"
                  @click="runAction(action.key, selectedRequest)"
                />
                <div v-if="selectedAvailableActions.length === 0" class="text-caption text-grey-7 q-mt-sm">
                  Для роли "{{ roleLabel(currentRole) }}" на этом этапе нет доступных действий.
                </div>
              </div>
            </q-card-section>

            <q-card-section v-if="selectedRequest.validationErrors.length > 0">
              <q-banner dense rounded class="bg-red-1 text-negative">
                <div class="text-subtitle2 q-mb-xs">Найдены ошибки в заявке</div>
                <ul class="q-pl-md q-my-xs">
                  <li v-for="err in selectedRequest.validationErrors" :key="err">{{ err }}</li>
                </ul>
              </q-banner>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row items-center q-mb-sm">
                <div class="text-subtitle2">Движение по To-Be процессу</div>
                <q-space />
                <q-btn-toggle
                  v-model="processViewMode"
                  dense
                  no-caps
                  toggle-color="primary"
                  color="grey-3"
                  text-color="grey-8"
                  :options="processViewOptions"
                />
              </div>

              <div v-if="processViewMode === 'graph'" class="process-graph-wrap">
                <div class="bpmn-lanes-bg">
                  <div
                    v-for="lane in bpmnLanes"
                    :key="lane.key"
                    class="bpmn-lane-row"
                    :style="{ top: `${lane.y}px`, height: `${lane.height}px` }"
                  >
                    <div class="bpmn-lane-title">{{ lane.label }}</div>
                  </div>
                </div>
                <VueFlow
                  class="process-flow-canvas"
                  :nodes="processGraphNodes"
                  :edges="processGraphEdges"
                  :nodes-draggable="false"
                  :nodes-connectable="false"
                  :elements-selectable="false"
                  :zoom-on-double-click="false"
                  :fit-view-on-init="true"
                  :fit-view-options="{ padding: 0.18 }"
                  :min-zoom="0.25"
                  :max-zoom="1.6"
                />
              </div>

              <q-list v-else bordered separator class="rounded-borders">
                <q-item v-for="step in processSteps" :key="step.code">
                  <q-item-section avatar>
                    <q-icon :name="stepIcon(selectedRequest, step.code)" :color="stepColor(selectedRequest, step.code)" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ step.index }}. {{ step.title }}</q-item-label>
                    <q-item-label caption>{{ step.role }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-chip dense :color="stepColor(selectedRequest, step.code)" text-color="white">
                      {{ stepStateLabel(selectedRequest, step.code) }}
                    </q-chip>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="text-subtitle2 q-mb-sm">Состав заявки</div>
              <q-markup-table dense flat bordered>
                <thead>
                  <tr>
                    <th class="text-left">Товар</th>
                    <th class="text-left">Ед.</th>
                    <th class="text-right">Кол-во</th>
                    <th class="text-right">Цена</th>
                    <th class="text-right">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="line in selectedRequestLines" :key="line.productId">
                    <td>{{ line.name }}</td>
                    <td>{{ line.unit }}</td>
                    <td class="text-right">{{ line.qty }}</td>
                    <td class="text-right">{{ formatMoney(line.price) }}</td>
                    <td class="text-right">{{ formatMoney(line.qty * line.price) }}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="text-subtitle2 q-mb-sm">История</div>
              <q-timeline color="primary" layout="dense">
                <q-timeline-entry
                  v-for="entry in selectedHistory"
                  :key="`${entry.at}-${entry.action}`"
                  :title="entry.action"
                  :subtitle="formatDateTime(entry.at)"
                  icon="history"
                >
                  <div class="text-caption">
                    {{ entry.actor }}
                    <span v-if="entry.note"> | {{ entry.note }}</span>
                  </div>
                </q-timeline-entry>
              </q-timeline>
            </q-card-section>
          </q-card>

          <q-card v-else class="panel-card">
            <q-card-section>
              <div class="text-h6">Выберите заявку</div>
              <div class="text-body2 text-grey-7">
                В таблице слева выберите заявку, чтобы увидеть маршрут по to-be процессу и выполнить очередной шаг.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'suppliers'" class="fade-in">
      <q-card class="panel-card">
        <q-card-section class="row q-col-gutter-sm items-center">
          <div class="col-12 col-md-4">
            <q-input v-model.trim="supplierSearch" dense outlined label="Поиск поставщика" clearable>
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-8 text-right text-caption text-grey-7">
            Каталог используется при формировании заказа и расчете срока поставки.
          </div>
        </q-card-section>
        <q-separator />
        <q-table
          flat
          row-key="id"
          :rows="filteredSuppliers"
          :columns="supplierColumns"
          :pagination="{ rowsPerPage: 8 }"
        >
          <template #body-cell-rating="props">
            <q-td :props="props">
              <q-rating size="18px" :model-value="props.row.rating" max="5" color="secondary" readonly />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <div v-else-if="activeTab === 'products'" class="fade-in">
      <q-card class="panel-card">
        <q-card-section class="row q-col-gutter-sm items-center">
          <div class="col-12 col-md-4">
            <q-input v-model.trim="productSearch" dense outlined label="Поиск товара" clearable>
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="productSupplierFilter"
              dense
              outlined
              emit-value
              map-options
              :options="productSupplierOptions"
              label="Поставщик"
            />
          </div>
          <div class="col-12 col-md-4 text-right text-caption text-grey-7">
            Товары привязаны к поставщикам для имитации выбора в заявке.
          </div>
        </q-card-section>
        <q-separator />
        <q-table
          flat
          row-key="id"
          :rows="filteredProducts"
          :columns="productColumns"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-supplier="props">
            <q-td :props="props">{{ supplierName(props.row.supplierId) }}</q-td>
          </template>
          <template #body-cell-price="props">
            <q-td :props="props">{{ formatMoney(props.row.price) }}</q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <div v-else class="fade-in">
      <q-card class="panel-card">
        <q-card-section>
          <div class="text-h6 q-mb-sm">Карта To-Be процесса в прототипе</div>
          <q-list bordered separator>
            <q-item v-for="step in processSteps" :key="step.code">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">{{ step.index }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ step.title }}</q-item-label>
                <q-item-label caption>{{ step.role }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section class="q-pt-none text-body2 text-grey-8">
          Прототип полностью клиентский: все данные хранятся в браузере (localStorage), а переходы между статусами
          управляются кнопками по ролям.
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="requestDialog.open" persistent>
      <q-card class="dialog-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ requestDialog.isEdit ? 'Редактирование заявки' : 'Создание заявки' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model.trim="form.department" outlined dense label="Подразделение-заказчик *" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model.trim="form.initiator" outlined dense label="Инициатор *" />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.supplierId"
                outlined
                dense
                emit-value
                map-options
                :options="supplierOptions"
                label="Поставщик *"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="form.plannedDeliveryDate" outlined dense type="date" label="План поставки *" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model.number="form.budgetLimit" outlined dense type="number" min="0" label="Бюджет, ₽ *" />
            </div>
            <div class="col-12">
              <q-input
                v-model.trim="form.justification"
                outlined
                autogrow
                dense
                type="textarea"
                label="Обоснование закупки *"
              />
            </div>
          </div>

          <div class="text-subtitle2 q-mt-md q-mb-sm">Позиции заявки</div>
          <div v-for="(item, index) in form.items" :key="`form-item-${index}`" class="row q-col-gutter-sm items-center q-mb-sm">
            <div class="col-12 col-md-7">
              <q-select
                v-model="item.productId"
                dense
                outlined
                emit-value
                map-options
                :options="formProductOptions"
                label="Товар *"
              />
            </div>
            <div class="col-5 col-md-2">
              <q-input v-model.number="item.qty" dense outlined type="number" min="1" label="Кол-во *" />
            </div>
            <div class="col-5 col-md-2">
              <q-input dense outlined :model-value="formatMoney(formItemAmount(item))" label="Сумма" readonly />
            </div>
            <div class="col-2 col-md-1 text-right">
              <q-btn
                flat
                round
                icon="delete"
                color="negative"
                :disable="form.items.length === 1"
                @click="removeFormItem(index)"
              />
            </div>
          </div>

          <div class="row items-center q-mt-sm">
            <q-btn flat color="primary" icon="add" label="Добавить позицию" @click="addFormItem" />
            <q-space />
            <div class="text-subtitle1 text-weight-bold">Итого: {{ formatMoney(formTotal) }}</div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="grey-8" v-close-popup />
          <q-btn color="primary" label="Сохранить" @click="saveRequestFromDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { VueFlow, type Edge, type Node } from '@vue-flow/core';
import {
  clone,
  createDemoState,
  dateOffset,
  emptyFormState,
  formatIsoDate,
  nowIso,
  PROCESS_STEPS,
  STATUS_META,
  STATUS_TO_STEP,
  type ProcurementRequest,
  type Product,
  type ProcessStep,
  type RequestFormItem,
  type RequestFormState,
  type RequestStatus,
  type Supplier,
  type UserRole,
} from 'src/data/procurement';

type ActiveTab = 'process' | 'suppliers' | 'products' | 'guide';
type ProcessViewMode = 'graph' | 'list';
type StatusFilter = 'all' | RequestStatus;
type ProductSupplierFilter = 'all' | number;
type ActionKey =
  | 'edit'
  | 'submit'
  | 'runCheck'
  | 'sendOrder'
  | 'receiveInvoice'
  | 'payInvoice'
  | 'notifySupplier'
  | 'sendReminder'
  | 'supplierReply'
  | 'receiveGoods'
  | 'uploadAct'
  | 'closeRequest'
  | 'handover'
  | 'autoComplete';

interface Option<T = string | number> {
  label: string;
  value: T;
}

interface DashboardCard {
  key: string;
  label: string;
  value: number;
  caption: string;
}

interface SelectedLine {
  productId: number;
  name: string;
  unit: string;
  qty: number;
  price: number;
}

interface RequestDialogState {
  open: boolean;
  isEdit: boolean;
  requestId: string | null;
}

interface ActionDefinition {
  key: ActionKey;
  label: string;
  icon: string;
  color: string;
  roles: UserRole[];
}

type ActionButton = Omit<ActionDefinition, 'roles'>;

interface StageGuidance {
  title: string;
  roleLabel: string;
  text: string;
}

type StepVisualState = 'done' | 'current' | 'error' | 'pending';
type BpmnLaneKey = UserRole;
type BpmnNodeKind = 'event-start' | 'event-end' | 'task' | 'gateway';

interface BpmnLaneDefinition {
  key: BpmnLaneKey;
  label: string;
  y: number;
  height: number;
}

interface BpmnGraphNodeSpec {
  id: string;
  lane: BpmnLaneKey;
  kind: BpmnNodeKind;
  label: string;
  x: number;
  stepCode?: ProcessStep['code'];
}

interface BpmnGraphEdgeSpec {
  source: string;
  target: string;
  label?: string;
  dashed?: boolean;
}

const STORAGE_KEY = 'mk-procurement-prototype-v3';

const $q = useQuasar();

const activeTab = ref<ActiveTab>('process');
const processViewMode = ref<ProcessViewMode>('graph');
const currentRole = ref<UserRole>('requester');
const requestSearch = ref('');
const statusFilter = ref<StatusFilter>('all');
const supplierSearch = ref('');
const productSearch = ref('');
const productSupplierFilter = ref<ProductSupplierFilter>('all');

const suppliers = ref<Supplier[]>([]);
const products = ref<Product[]>([]);
const requests = ref<ProcurementRequest[]>([]);
const selectedRequestId = ref<string | null>(null);

const requestDialog = ref<RequestDialogState>({
  open: false,
  isEdit: false,
  requestId: null,
});
const form = ref<RequestFormState>(emptyFormState());

const roleOptions: Option<UserRole>[] = [
  { label: 'Подразделение-заказчик', value: 'requester' },
  { label: 'Отдел снабжения', value: 'supply' },
  { label: 'Бухгалтерия', value: 'accounting' },
  { label: 'Склад', value: 'warehouse' },
  { label: 'ИС (автодействия)', value: 'system' },
];

const processViewOptions: Option<ProcessViewMode>[] = [
  { label: 'Граф', value: 'graph' },
  { label: 'Список', value: 'list' },
];

const BPMN_LANES: BpmnLaneDefinition[] = [
  { key: 'requester', label: 'Подразделение-заказчик', y: 20, height: 112 },
  { key: 'system', label: 'ИС', y: 146, height: 112 },
  { key: 'supply', label: 'Отдел снабжения', y: 272, height: 112 },
  { key: 'accounting', label: 'Бухгалтерия', y: 398, height: 112 },
  { key: 'warehouse', label: 'Склад', y: 524, height: 112 },
];
const bpmnLanes = BPMN_LANES;

const BPMN_GRAPH_NODE_SPECS: BpmnGraphNodeSpec[] = [
  { id: 'start', lane: 'requester', kind: 'event-start', label: 'Старт', x: 70 },
  { id: 'create', lane: 'requester', kind: 'task', label: '1. Заполнение заявки', x: 180, stepCode: 'create' },
  { id: 'check', lane: 'system', kind: 'task', label: '2. Автопроверка', x: 420, stepCode: 'check' },
  { id: 'gw-valid', lane: 'system', kind: 'gateway', label: 'Данные корректны?', x: 620, stepCode: 'check' },
  { id: 'fix', lane: 'requester', kind: 'task', label: 'Исправить заявку', x: 620, stepCode: 'check' },
  { id: 'register', lane: 'system', kind: 'task', label: '3. Регистрация заявки', x: 820, stepCode: 'register' },
  { id: 'order', lane: 'supply', kind: 'task', label: '4. Отправка заказа', x: 1040, stepCode: 'order' },
  { id: 'invoice', lane: 'supply', kind: 'task', label: '5. Получение счета', x: 1240, stepCode: 'invoice' },
  { id: 'pay', lane: 'accounting', kind: 'task', label: '6. Проведение оплаты', x: 1440, stepCode: 'payment' },
  { id: 'notify', lane: 'system', kind: 'task', label: 'Уведомление поставщику', x: 1640, stepCode: 'payment' },
  { id: 'gw-delay', lane: 'system', kind: 'gateway', label: 'Срок истек?', x: 1840, stepCode: 'control' },
  { id: 'reminder', lane: 'supply', kind: 'task', label: 'Напоминание поставщику', x: 1840, stepCode: 'control' },
  { id: 'receive', lane: 'warehouse', kind: 'task', label: '8. Приемка товара', x: 2040, stepCode: 'warehouse' },
  { id: 'act', lane: 'warehouse', kind: 'task', label: '9. Загрузка акта', x: 2240, stepCode: 'act' },
  { id: 'close', lane: 'supply', kind: 'task', label: '10. Закрытие закупки', x: 2440, stepCode: 'close' },
  { id: 'handover', lane: 'warehouse', kind: 'task', label: '11. Выдача заказчику', x: 2640, stepCode: 'handover' },
  { id: 'end', lane: 'requester', kind: 'event-end', label: 'Финиш', x: 2860 },
];

const BPMN_GRAPH_EDGE_SPECS: BpmnGraphEdgeSpec[] = [
  { source: 'start', target: 'create' },
  { source: 'create', target: 'check' },
  { source: 'check', target: 'gw-valid' },
  { source: 'gw-valid', target: 'register', label: 'Да' },
  { source: 'gw-valid', target: 'fix', label: 'Нет', dashed: true },
  { source: 'fix', target: 'check', label: 'После исправления', dashed: true },
  { source: 'register', target: 'order' },
  { source: 'order', target: 'invoice' },
  { source: 'invoice', target: 'pay' },
  { source: 'pay', target: 'notify' },
  { source: 'notify', target: 'gw-delay' },
  { source: 'gw-delay', target: 'receive', label: 'Нет' },
  { source: 'gw-delay', target: 'reminder', label: 'Да', dashed: true },
  { source: 'reminder', target: 'receive', label: 'После ответа', dashed: true },
  { source: 'receive', target: 'act' },
  { source: 'act', target: 'close' },
  { source: 'close', target: 'handover' },
  { source: 'handover', target: 'end' },
];

const processSteps = PROCESS_STEPS;
const statusMeta = STATUS_META;

const requestColumns: QTableColumn<ProcurementRequest>[] = [
  { name: 'id', label: 'Заявка', field: 'id', align: 'left', sortable: true },
  { name: 'department', label: 'Подразделение', field: 'department', align: 'left', sortable: true },
  { name: 'supplier', label: 'Поставщик', field: (row) => row.supplierId ?? 0, align: 'left' },
  { name: 'status', label: 'Статус', field: 'status', align: 'left' },
  { name: 'total', label: 'Сумма', field: (row) => requestTotal(row), align: 'right' },
  {
    name: 'plannedDeliveryDate',
    label: 'Поставка',
    field: 'plannedDeliveryDate',
    align: 'left',
    sortable: true,
  },
];

const supplierColumns: QTableColumn<Supplier>[] = [
  { name: 'name', label: 'Поставщик', field: 'name', align: 'left', sortable: true },
  { name: 'city', label: 'Город', field: 'city', align: 'left', sortable: true },
  { name: 'category', label: 'Категория', field: 'category', align: 'left' },
  { name: 'leadTimeDays', label: 'Срок поставки, дн', field: 'leadTimeDays', align: 'right', sortable: true },
  { name: 'rating', label: 'Рейтинг', field: 'rating', align: 'center' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
];

const productColumns: QTableColumn<Product>[] = [
  { name: 'name', label: 'Товар', field: 'name', align: 'left', sortable: true },
  { name: 'supplier', label: 'Поставщик', field: 'supplierId', align: 'left' },
  { name: 'category', label: 'Категория', field: 'category', align: 'left' },
  { name: 'sku', label: 'Артикул', field: 'sku', align: 'left' },
  { name: 'price', label: 'Цена', field: 'price', align: 'right', sortable: true },
  { name: 'stock', label: 'Остаток', field: 'stock', align: 'right', sortable: true },
];

const statusOptions = computed<Option<StatusFilter>[]>(() => {
  const all: Option<StatusFilter> = { label: 'Все статусы', value: 'all' };
  const statuses = (Object.keys(statusMeta) as RequestStatus[]).map((status) => ({
    label: statusMeta[status].label,
    value: status,
  }));
  return [all, ...statuses];
});

const supplierOptions = computed<Option<number>[]>(() =>
  suppliers.value.map((supplier) => ({ label: supplier.name, value: supplier.id })),
);

const formProductOptions = computed<Option<number>[]>(() =>
  products.value
    .filter((item) => (form.value.supplierId ? item.supplierId === form.value.supplierId : true))
    .map((item) => ({
      label: `${item.name} (${formatMoney(item.price)} / ${item.unit})`,
      value: item.id,
    })),
);

const formTotal = computed<number>(() =>
  form.value.items.reduce((sum, item) => {
    const product = item.productId !== null ? productById(item.productId) : null;
    const qty = Number(item.qty) || 0;
    return sum + (product ? product.price * qty : 0);
  }, 0),
);

const filteredRequests = computed<ProcurementRequest[]>(() => {
  const search = requestSearch.value.toLowerCase();
  return requests.value
    .filter((row) => (statusFilter.value === 'all' ? true : row.status === statusFilter.value))
    .filter((row) => {
      if (!search) {
        return true;
      }
      const inId = row.id.toLowerCase().includes(search);
      const inDepartment = row.department.toLowerCase().includes(search);
      const inSupplier = supplierName(row.supplierId).toLowerCase().includes(search);
      return inId || inDepartment || inSupplier;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
});

const filteredSuppliers = computed<Supplier[]>(() => {
  const search = supplierSearch.value.toLowerCase();
  return suppliers.value.filter((supplier) => {
    if (!search) {
      return true;
    }
    return (
      supplier.name.toLowerCase().includes(search) ||
      supplier.city.toLowerCase().includes(search) ||
      supplier.category.toLowerCase().includes(search)
    );
  });
});

const productSupplierOptions = computed<Option<ProductSupplierFilter>[]>(() => [
  { label: 'Все поставщики', value: 'all' },
  ...suppliers.value.map((supplier) => ({ label: supplier.name, value: supplier.id })),
]);

const filteredProducts = computed<Product[]>(() => {
  const search = productSearch.value.toLowerCase();
  return products.value
    .filter((row) => (productSupplierFilter.value === 'all' ? true : row.supplierId === productSupplierFilter.value))
    .filter((row) => {
      if (!search) {
        return true;
      }
      return (
        row.name.toLowerCase().includes(search) ||
        row.sku.toLowerCase().includes(search) ||
        row.category.toLowerCase().includes(search) ||
        supplierName(row.supplierId).toLowerCase().includes(search)
      );
    });
});

const selectedRequest = computed<ProcurementRequest | null>(
  () => requests.value.find((row) => row.id === selectedRequestId.value) ?? null,
);

const selectedRequestLines = computed<SelectedLine[]>(() => {
  if (!selectedRequest.value) {
    return [];
  }
  return selectedRequest.value.items.map((item) => {
    const product = productById(item.productId);
    return {
      productId: item.productId,
      name: product ? product.name : 'Неизвестный товар',
      unit: product ? product.unit : 'шт',
      qty: item.qty,
      price: item.price,
    };
  });
});

const selectedHistory = computed(() => {
  if (!selectedRequest.value) {
    return [];
  }
  return clone(selectedRequest.value.history).sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
});

const dashboardCards = computed<DashboardCard[]>(() => {
  const total = requests.value.length;
  const completed = requests.value.filter((row) => row.status === 'completed').length;
  const onControl = requests.value.filter((row) => row.status === 'waiting_delivery').length;
  const overdue = requests.value.filter((row) => row.status === 'waiting_delivery' && isOverdue(row)).length;
  return [
    { key: 'total', label: 'Всего заявок', value: total, caption: 'в реестре прототипа' },
    { key: 'completed', label: 'Завершено', value: completed, caption: 'закрыто и выдано заказчику' },
    { key: 'control', label: 'На контроле поставки', value: onControl, caption: 'ожидание факта поставки' },
    { key: 'overdue', label: 'Просрочка', value: overdue, caption: 'требуется напоминание поставщику' },
  ];
});

const selectedAvailableActions = computed<ActionButton[]>(() => {
  if (!selectedRequest.value) {
    return [];
  }
  return availableActions(selectedRequest.value);
});

const stageGuidance = computed<StageGuidance>(() => {
  if (!selectedRequest.value) {
    return {
      title: 'Выберите заявку',
      roleLabel: '—',
      text: 'Выберите строку в таблице заявок слева для просмотра текущего этапа.',
    };
  }
  return buildStageGuidance(selectedRequest.value);
});

const processGraphNodes = computed<Node[]>(() => {
  const request = selectedRequest.value;
  if (!request) {
    return [];
  }

  const flowNodes: Node[] = BPMN_GRAPH_NODE_SPECS.map((spec) => {
    const lane = laneByKey(spec.lane);
    const state = graphNodeState(request, spec);
    const yOffset =
      spec.kind === 'task'
        ? 22
        : spec.kind === 'gateway'
          ? 26
          : 20;

    return {
      id: spec.id,
      position: { x: spec.x, y: lane.y + yOffset },
      draggable: false,
      selectable: false,
      connectable: false,
      class: graphNodeClass(spec.kind),
      data: {
        label: spec.label,
      },
      style: graphNodeStyle(spec.kind, state),
      zIndex: 10,
    } satisfies Node;
  });

  return flowNodes;
});

const processGraphEdges = computed<Edge[]>(() => {
  const request = selectedRequest.value;
  if (!request) {
    return [];
  }

  return BPMN_GRAPH_EDGE_SPECS.map((edgeSpec) => {
    const state = graphEdgeState(request, edgeSpec.source);
    const edge: Edge = {
      id: `edge-${edgeSpec.source}-${edgeSpec.target}`,
      source: edgeSpec.source,
      target: edgeSpec.target,
      animated: state === 'current',
      style: graphEdgeStyle(state, edgeSpec.dashed === true),
    };

    if (edgeSpec.label) {
      edge.label = edgeSpec.label;
      edge.labelShowBg = true;
      edge.labelBgPadding = [4, 2];
      edge.labelBgBorderRadius = 4;
    }

    return edge;
  });
});

function supplierById(supplierId: number | null): Supplier | null {
  if (supplierId === null) {
    return null;
  }
  return suppliers.value.find((row) => row.id === supplierId) ?? null;
}

function supplierName(supplierId: number | null): string {
  const supplier = supplierById(supplierId);
  return supplier ? supplier.name : 'Не выбран';
}

function productById(productId: number): Product | null {
  return products.value.find((row) => row.id === productId) ?? null;
}

function requestTotal(request: ProcurementRequest): number {
  return request.items.reduce((sum, item) => sum + item.qty * item.price, 0);
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  return new Intl.DateTimeFormat('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function isOverdue(request: ProcurementRequest): boolean {
  if (!request.plannedDeliveryDate || request.status !== 'waiting_delivery') {
    return false;
  }
  const today = formatIsoDate(new Date());
  return request.plannedDeliveryDate < today;
}

function deliveryHint(request: ProcurementRequest): string {
  if (!request.plannedDeliveryDate) {
    return 'дата не задана';
  }
  if (request.status !== 'waiting_delivery') {
    return 'по графику процесса';
  }
  if (isOverdue(request)) {
    return 'срок истек';
  }
  return 'в контроле';
}

function persistState(): void {
  const payload = {
    suppliers: suppliers.value,
    products: products.value,
    requests: requests.value,
    selectedRequestId: selectedRequestId.value,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function initData(): void {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as {
        suppliers?: Supplier[];
        products?: Product[];
        requests?: ProcurementRequest[];
        selectedRequestId?: string | null;
      };
      if (Array.isArray(parsed.suppliers) && Array.isArray(parsed.products) && Array.isArray(parsed.requests)) {
        suppliers.value = parsed.suppliers;
        products.value = parsed.products;
        requests.value = parsed.requests;
        selectedRequestId.value = parsed.selectedRequestId ?? (requests.value[0]?.id ?? null);
        return;
      }
    } catch (error) {
      console.warn('Не удалось прочитать localStorage, будут загружены демо-данные', error);
    }
  }

  const demo = createDemoState();
  suppliers.value = demo.suppliers;
  products.value = demo.products;
  requests.value = demo.requests;
  selectedRequestId.value = demo.selectedRequestId;
  persistState();
}

function resetDemoData(): void {
  $q.dialog({
    title: 'Сброс данных',
    message: 'Восстановить исходные моковые данные и очистить текущие изменения?',
    persistent: true,
    ok: { label: 'Сбросить', color: 'negative' },
    cancel: { label: 'Отмена', flat: true },
  }).onOk(() => {
    const demo = createDemoState();
    suppliers.value = demo.suppliers;
    products.value = demo.products;
    requests.value = demo.requests;
    selectedRequestId.value = demo.selectedRequestId;
    persistState();
    $q.notify({ type: 'positive', message: 'Демо-данные восстановлены.' });
  });
}

function onRequestRowClick(_evt: Event, row: ProcurementRequest): void {
  selectedRequestId.value = row.id;
  persistState();
}

function openCreateDialog(): void {
  requestDialog.value.open = true;
  requestDialog.value.isEdit = false;
  requestDialog.value.requestId = null;
  form.value = emptyFormState();
}

function openEditDialog(request: ProcurementRequest): void {
  requestDialog.value.open = true;
  requestDialog.value.isEdit = true;
  requestDialog.value.requestId = request.id;
  form.value = {
    department: request.department,
    initiator: request.initiator,
    supplierId: request.supplierId,
    budgetLimit: request.budgetLimit,
    plannedDeliveryDate: request.plannedDeliveryDate,
    justification: request.justification,
    items: request.items.map((item) => ({ productId: item.productId, qty: item.qty })),
  };
  if (!form.value.items.length) {
    form.value.items = [{ productId: null, qty: 1 }];
  }
}

function addFormItem(): void {
  form.value.items.push({ productId: null, qty: 1 });
}

function removeFormItem(index: number): void {
  if (form.value.items.length === 1) {
    return;
  }
  form.value.items.splice(index, 1);
}

function formItemAmount(item: RequestFormItem): number {
  if (item.productId === null) {
    return 0;
  }
  const product = productById(item.productId);
  const qty = Number(item.qty) || 0;
  return product ? product.price * qty : 0;
}

function normalizeFormItems(): { productId: number; qty: number; price: number }[] {
  return form.value.items
    .filter((item) => item.productId !== null)
    .map((item) => {
      const product = productById(item.productId as number);
      return {
        productId: item.productId as number,
        qty: Number(item.qty) || 0,
        price: product ? product.price : 0,
      };
    });
}

function generateRequestId(): string {
  const year = new Date().getFullYear();
  const maxNum = requests.value.reduce((max, row) => {
    const parts = row.id.split('-');
    const number = Number(parts[parts.length - 1]);
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);
  return `З-${year}-${String(maxNum + 1).padStart(3, '0')}`;
}

function saveRequestFromDialog(): void {
  const items = normalizeFormItems();
  if (!form.value.department || !form.value.initiator || !form.value.supplierId) {
    $q.notify({ type: 'negative', message: 'Заполните обязательные поля заявки.' });
    return;
  }
  if (!form.value.justification || form.value.justification.length < 10) {
    $q.notify({ type: 'negative', message: 'Добавьте развернутое обоснование (минимум 10 символов).' });
    return;
  }
  if (!form.value.plannedDeliveryDate || !form.value.budgetLimit || Number(form.value.budgetLimit) <= 0) {
    $q.notify({ type: 'negative', message: 'Укажите плановую дату поставки и бюджет.' });
    return;
  }
  if (!items.length || items.some((item) => item.qty <= 0)) {
    $q.notify({ type: 'negative', message: 'Проверьте позиции: товар и количество должны быть заполнены.' });
    return;
  }

  if (requestDialog.value.isEdit) {
    const request = requests.value.find((row) => row.id === requestDialog.value.requestId);
    if (!request) {
      $q.notify({ type: 'negative', message: 'Заявка для редактирования не найдена.' });
      return;
    }
    request.department = form.value.department;
    request.initiator = form.value.initiator;
    request.supplierId = form.value.supplierId;
    request.budgetLimit = Number(form.value.budgetLimit);
    request.plannedDeliveryDate = form.value.plannedDeliveryDate;
    request.justification = form.value.justification;
    request.items = items;
    logEvent(request, 'Подразделение-заказчик', 'Исправлены данные заявки', 'Данные обновлены в форме');
    selectedRequestId.value = request.id;
  } else {
    const request: ProcurementRequest = {
      id: generateRequestId(),
      department: form.value.department,
      initiator: form.value.initiator,
      supplierId: form.value.supplierId,
      budgetLimit: Number(form.value.budgetLimit),
      plannedDeliveryDate: form.value.plannedDeliveryDate,
      justification: form.value.justification,
      status: 'draft',
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
    logEvent(request, 'Подразделение-заказчик', 'Создана заявка', 'Черновик в ИС');
    requests.value.unshift(request);
    selectedRequestId.value = request.id;
  }

  persistState();
  requestDialog.value.open = false;
  $q.notify({ type: 'positive', message: 'Заявка сохранена.' });
}

function roleLabel(roleCode: UserRole): string {
  const role = roleOptions.find((row) => row.value === roleCode);
  return role ? role.label : roleCode;
}

function statusLabel(status: RequestStatus): string {
  return statusMeta[status].label;
}

function statusColor(status: RequestStatus): string {
  return statusMeta[status].color;
}

function availableActions(request: ProcurementRequest): ActionButton[] {
  const actionsByStatus: Record<RequestStatus, ActionKey[]> = {
    draft: ['edit', 'submit', 'autoComplete'],
    submitted: ['runCheck', 'autoComplete'],
    need_fix: ['edit', 'submit', 'autoComplete'],
    registered: ['sendOrder', 'autoComplete'],
    order_sent: ['receiveInvoice', 'autoComplete'],
    invoice_received: ['payInvoice', 'autoComplete'],
    paid: ['notifySupplier', 'autoComplete'],
    waiting_delivery: ['sendReminder', 'supplierReply', 'receiveGoods', 'autoComplete'],
    warehouse_received: ['uploadAct', 'autoComplete'],
    act_uploaded: ['closeRequest', 'autoComplete'],
    closed: ['handover', 'autoComplete'],
    completed: [],
  };

  const actionMeta: Record<ActionKey, ActionDefinition> = {
    edit: {
      key: 'edit',
      label: 'Исправить заявку',
      icon: 'edit',
      color: 'blue-8',
      roles: ['requester'],
    },
    submit: {
      key: 'submit',
      label: 'Отправить в ИС',
      icon: 'send',
      color: 'primary',
      roles: ['requester'],
    },
    runCheck: {
      key: 'runCheck',
      label: 'Запустить автопроверку',
      icon: 'task_alt',
      color: 'indigo-8',
      roles: ['system'],
    },
    sendOrder: {
      key: 'sendOrder',
      label: 'Отправить заказ поставщику',
      icon: 'send',
      color: 'deep-orange-8',
      roles: ['supply'],
    },
    receiveInvoice: {
      key: 'receiveInvoice',
      label: 'Зарегистрировать счет',
      icon: 'receipt_long',
      color: 'brown-7',
      roles: ['supply'],
    },
    payInvoice: {
      key: 'payInvoice',
      label: 'Провести оплату',
      icon: 'paid',
      color: 'teal-7',
      roles: ['accounting'],
    },
    notifySupplier: {
      key: 'notifySupplier',
      label: 'Уведомить поставщика об оплате',
      icon: 'notifications_active',
      color: 'cyan-8',
      roles: ['system'],
    },
    sendReminder: {
      key: 'sendReminder',
      label: 'Отправить напоминание',
      icon: 'notification_important',
      color: 'orange-8',
      roles: ['system', 'supply'],
    },
    supplierReply: {
      key: 'supplierReply',
      label: 'Зафиксировать ответ поставщика',
      icon: 'support_agent',
      color: 'grey-8',
      roles: ['supply'],
    },
    receiveGoods: {
      key: 'receiveGoods',
      label: 'Принять товар на склад',
      icon: 'inventory',
      color: 'cyan-7',
      roles: ['warehouse'],
    },
    uploadAct: {
      key: 'uploadAct',
      label: 'Загрузить акт в ИС',
      icon: 'upload_file',
      color: 'blue-grey-7',
      roles: ['warehouse'],
    },
    closeRequest: {
      key: 'closeRequest',
      label: 'Закрыть заявку',
      icon: 'fact_check',
      color: 'positive',
      roles: ['supply'],
    },
    handover: {
      key: 'handover',
      label: 'Выдать товар заказчику',
      icon: 'move_to_inbox',
      color: 'green-8',
      roles: ['warehouse'],
    },
    autoComplete: {
      key: 'autoComplete',
      label: 'Автопрогон до завершения',
      icon: 'smart_toy',
      color: 'accent',
      roles: ['requester', 'supply', 'accounting', 'warehouse', 'system'],
    },
  };

  return (actionsByStatus[request.status] ?? []).flatMap((key) => {
    const meta = actionMeta[key];
    const allowed = meta.roles.includes(currentRole.value);
    if (!allowed) {
      return [];
    }
    return [{
      key: meta.key,
      label: meta.label,
      icon: meta.icon,
      color: meta.color,
    }];
  });
}

function buildStageGuidance(request: ProcurementRequest): StageGuidance {
  const roleSupply = roleLabel('supply');
  const roleSystem = roleLabel('system');
  const roleRequester = roleLabel('requester');
  const roleAccounting = roleLabel('accounting');
  const roleWarehouse = roleLabel('warehouse');

  switch (request.status) {
    case 'draft':
      return {
        title: 'Черновик заявки',
        roleLabel: roleRequester,
        text: 'Заполните форму, проверьте позиции и отправьте заявку в ИС.',
      };
    case 'need_fix':
      return {
        title: 'Возврат на доработку',
        roleLabel: roleRequester,
        text: 'Исправьте ошибки автопроверки и повторно отправьте заявку в ИС.',
      };
    case 'submitted':
      return {
        title: 'Автопроверка данных',
        roleLabel: roleSystem,
        text: 'ИС должна проверить корректность заявки и зарегистрировать ее или вернуть на доработку.',
      };
    case 'registered':
      return {
        title: 'Подготовка заказа',
        roleLabel: roleSupply,
        text: 'Снабжение формирует и отправляет заказ поставщику.',
      };
    case 'order_sent':
      return {
        title: 'Ожидание счета',
        roleLabel: roleSupply,
        text: 'После получения счета от поставщика зарегистрируйте счет в ИС.',
      };
    case 'invoice_received':
      return {
        title: 'Проведение оплаты',
        roleLabel: roleAccounting,
        text: 'Бухгалтерия проверяет счет и проводит оплату.',
      };
    case 'paid':
      return {
        title: 'Уведомление поставщика',
        roleLabel: roleSystem,
        text: 'ИС отправляет поставщику уведомление об оплате и запускает контроль срока.',
      };
    case 'waiting_delivery':
      if (isOverdue(request)) {
        return {
          title: 'Контроль просрочки',
          roleLabel: `${roleSystem} / ${roleSupply}`,
          text: 'Нужно отправить напоминание поставщику и зафиксировать обратную связь.',
        };
      }
      return {
        title: 'Ожидание поставки',
        roleLabel: roleWarehouse,
        text: 'После фактической поставки склад должен принять товар.',
      };
    case 'warehouse_received':
      return {
        title: 'Оформление приемки',
        roleLabel: roleWarehouse,
        text: 'Склад загружает акт приемки в ИС.',
      };
    case 'act_uploaded':
      return {
        title: 'Проверка комплекта документов',
        roleLabel: roleSupply,
        text: 'Снабжение проверяет документы и закрывает закупку.',
      };
    case 'closed':
      return {
        title: 'Выдача заказчику',
        roleLabel: roleWarehouse,
        text: 'Склад выдает товар подразделению-заказчику.',
      };
    case 'completed':
      return {
        title: 'Процесс завершен',
        roleLabel: '—',
        text: 'Действий не требуется. Закупка полностью выполнена.',
      };
    default:
      return {
        title: 'Этап процесса',
        roleLabel: '—',
        text: 'Проверьте состояние заявки.',
      };
  }
}

function runAction(actionKey: ActionKey, request: ProcurementRequest): void {
  switch (actionKey) {
    case 'edit':
      openEditDialog(request);
      return;
    case 'submit':
      submitRequest(request);
      return;
    case 'runCheck':
      runAutoCheck(request);
      return;
    case 'sendOrder':
      sendOrder(request);
      return;
    case 'receiveInvoice':
      receiveInvoice(request);
      return;
    case 'payInvoice':
      payInvoice(request);
      return;
    case 'notifySupplier':
      notifySupplier(request);
      return;
    case 'sendReminder':
      sendReminder(request);
      return;
    case 'supplierReply':
      captureSupplierReply(request);
      return;
    case 'receiveGoods':
      receiveGoods(request);
      return;
    case 'uploadAct':
      uploadAct(request);
      return;
    case 'closeRequest':
      closeRequest(request);
      return;
    case 'handover':
      handover(request);
      return;
    case 'autoComplete':
      autoComplete(request);
      return;
    default:
      return;
  }
}

function logEvent(
  request: ProcurementRequest,
  actor: string,
  action: string,
  note: string,
  nextStatus?: RequestStatus,
): void {
  if (nextStatus) {
    request.status = nextStatus;
  }
  request.updatedAt = nowIso();
  request.history.push({
    at: nowIso(),
    actor,
    action,
    note,
  });
}

function validateRequest(request: ProcurementRequest): string[] {
  const errors: string[] = [];
  if (!request.department) {
    errors.push('Не указано подразделение-заказчик.');
  }
  if (!request.initiator) {
    errors.push('Не указан инициатор заявки.');
  }
  if (!request.supplierId) {
    errors.push('Не выбран поставщик.');
  }
  if (!request.justification || request.justification.length < 10) {
    errors.push('Обоснование закупки заполнено неполно.');
  }
  if (!request.plannedDeliveryDate) {
    errors.push('Не задана плановая дата поставки.');
  }
  if (!request.items.length) {
    errors.push('В заявке нет ни одной позиции.');
  }

  request.items.forEach((item) => {
    const product = productById(item.productId);
    if (!product) {
      errors.push('Обнаружена позиция с несуществующим товаром.');
      return;
    }
    if (item.qty <= 0) {
      errors.push(`Позиция "${product.name}": количество должно быть больше нуля.`);
    }
  });

  const total = requestTotal(request);
  if (total > request.budgetLimit) {
    errors.push(`Сумма ${formatMoney(total)} превышает бюджет ${formatMoney(request.budgetLimit)}.`);
  }
  return errors;
}

function submitRequest(request: ProcurementRequest, options?: { silent?: boolean }): void {
  if (!(request.status === 'draft' || request.status === 'need_fix')) {
    return;
  }
  request.validationErrors = [];
  logEvent(request, 'Подразделение-заказчик', 'Заявка отправлена в ИС', 'Передана на автопроверку', 'submitted');
  persistState();
  if (!options?.silent) {
    $q.notify({ type: 'positive', message: 'Заявка отправлена на автопроверку.' });
  }
}

function generateRegistrationNumber(): string {
  const year = new Date().getFullYear();
  const count = requests.value.filter((row) => row.registrationNumber).length + 1;
  return `РГ-${year}-${String(count).padStart(4, '0')}`;
}

function runAutoCheck(request: ProcurementRequest, options?: { silent?: boolean }): void {
  if (request.status !== 'submitted') {
    return;
  }
  const errors = validateRequest(request);
  if (errors.length > 0) {
    request.validationErrors = errors;
    logEvent(request, 'ИС', 'Автопроверка: нужны исправления', 'Возврат заявки на доработку', 'need_fix');
    persistState();
    if (!options?.silent) {
      $q.notify({ type: 'warning', message: 'Проверка не пройдена. Исправьте заявку.' });
    }
    return;
  }

  request.validationErrors = [];
  if (!request.registrationNumber) {
    request.registrationNumber = generateRegistrationNumber();
  }
  logEvent(
    request,
    'ИС',
    'Заявка зарегистрирована',
    `Регистрационный номер: ${request.registrationNumber}`,
    'registered',
  );
  persistState();
  if (!options?.silent) {
    $q.notify({ type: 'positive', message: 'Автопроверка успешна. Заявка зарегистрирована.' });
  }
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const count = requests.value.filter((row) => row.orderNumber).length + 1;
  return `ЗК-${year}-${String(count).padStart(4, '0')}`;
}

function sendOrder(request: ProcurementRequest, options?: { silent?: boolean }): void {
  if (request.status !== 'registered') {
    return;
  }
  if (!request.orderNumber) {
    request.orderNumber = generateOrderNumber();
  }
  const supplier = supplierById(request.supplierId);
  request.expectedDeliveryDate = dateOffset(supplier ? supplier.leadTimeDays : 3);
  logEvent(request, 'Отдел снабжения', 'Заказ поставщику отправлен', request.orderNumber, 'order_sent');
  persistState();
  if (!options?.silent) {
    $q.notify({ type: 'positive', message: 'Заказ отправлен поставщику.' });
  }
}

function receiveInvoice(request: ProcurementRequest, options?: { silent?: boolean }): void {
  if (request.status !== 'order_sent') {
    return;
  }
  const supplier = supplierById(request.supplierId);
  const code = supplier
    ? supplier.name
        .replace(/[^A-Za-zА-Яа-я]/g, '')
        .slice(0, 3)
        .toUpperCase()
    : 'SUP';
  request.invoice = {
    number: `СЧ-${code}-${Math.floor(100 + Math.random() * 900)}`,
    date: formatIsoDate(new Date()),
    amount: requestTotal(request),
  };
  logEvent(request, 'Поставщик', 'Получен счет', request.invoice.number, 'invoice_received');
  persistState();
  if (!options?.silent) {
    $q.notify({ type: 'positive', message: 'Счет зарегистрирован и передан в бухгалтерию.' });
  }
}

function payInvoice(request: ProcurementRequest, options?: { silent?: boolean }): void {
  if (request.status !== 'invoice_received') {
    return;
  }
  request.paymentDate = formatIsoDate(new Date());
  logEvent(request, 'Бухгалтерия', 'Оплата проведена', `Дата платежа: ${request.paymentDate}`, 'paid');
  persistState();
  if (!options?.silent) {
    $q.notify({ type: 'positive', message: 'Оплата проведена.' });
  }
}

function notifySupplier(request: ProcurementRequest, options?: { silent?: boolean }): void {
  if (request.status !== 'paid') {
    return;
  }
  logEvent(
    request,
    'ИС',
    'Отправлено уведомление поставщику',
    'Старт контроля срока поставки',
    'waiting_delivery',
  );
  persistState();
  if (!options?.silent) {
    $q.notify({ type: 'positive', message: 'Поставщик уведомлен. Контроль срока поставки включен.' });
  }
}

function sendReminder(request: ProcurementRequest, options?: { silent?: boolean }): void {
  if (request.status !== 'waiting_delivery') {
    return;
  }
  request.reminderCount = (request.reminderCount ?? 0) + 1;
  const text = `Напоминание №${request.reminderCount} отправлено поставщику`;
  request.reminders.push({ at: nowIso(), text });
  logEvent(request, 'ИС', 'Отправлено напоминание поставщику', text);
  persistState();
  if (!options?.silent) {
    $q.notify({ type: 'warning', message: text });
  }
}

function captureSupplierReply(request: ProcurementRequest): void {
  if (request.status !== 'waiting_delivery') {
    return;
  }
  $q.dialog({
    title: 'Ответ поставщика',
    prompt: {
      model: 'Поставка подтверждена, отгрузка завтра.',
      type: 'text',
    },
    persistent: true,
    ok: { label: 'Сохранить', color: 'primary' },
    cancel: { label: 'Отмена', flat: true },
  }).onOk((reply: string) => {
    logEvent(request, 'Отдел снабжения', 'Зафиксирован ответ поставщика', reply);
    persistState();
    $q.notify({ type: 'info', message: 'Ответ поставщика сохранен.' });
  });
}

function receiveGoods(request: ProcurementRequest, options?: { silent?: boolean }): void {
  if (request.status !== 'waiting_delivery') {
    return;
  }
  request.actualDeliveryDate = formatIsoDate(new Date());
  logEvent(request, 'Склад', 'Товар принят складом', 'Ожидается загрузка акта', 'warehouse_received');
  persistState();
  if (!options?.silent) {
    $q.notify({ type: 'positive', message: 'Товар принят складом.' });
  }
}

function uploadAct(request: ProcurementRequest, options?: { silent?: boolean }): void {
  if (request.status !== 'warehouse_received') {
    return;
  }
  const actNumber = `АКТ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  logEvent(request, 'Склад', 'Акт загружен в ИС', actNumber, 'act_uploaded');
  persistState();
  if (!options?.silent) {
    $q.notify({ type: 'positive', message: 'Акт загружен в ИС.' });
  }
}

function closeRequest(request: ProcurementRequest, options?: { silent?: boolean }): void {
  if (request.status !== 'act_uploaded') {
    return;
  }
  logEvent(request, 'Отдел снабжения', 'Комплект документов проверен', 'Закупка закрыта в ИС', 'closed');
  persistState();
  if (!options?.silent) {
    $q.notify({ type: 'positive', message: 'Заявка закрыта.' });
  }
}

function handover(request: ProcurementRequest, options?: { silent?: boolean }): void {
  if (request.status !== 'closed') {
    return;
  }
  logEvent(request, 'Склад', 'Товар выдан заказчику', 'Процесс завершен', 'completed');
  persistState();
  if (!options?.silent) {
    $q.notify({ type: 'positive', message: 'Заявка завершена.' });
  }
}

function ensureRequestValidForAutoflow(request: ProcurementRequest): void {
  if (!request.department) {
    request.department = 'Подразделение-заказчик';
  }
  if (!request.initiator) {
    request.initiator = 'Инициатор';
  }
  const firstSupplier = suppliers.value[0];
  if (!request.supplierId && firstSupplier) {
    request.supplierId = firstSupplier.id;
  }
  if (!request.plannedDeliveryDate) {
    request.plannedDeliveryDate = dateOffset(3);
  }
  if (!request.justification || request.justification.length < 10) {
    request.justification = 'Автоматически дополнено для прохождения проверки.';
  }
  if (!Array.isArray(request.items) || !request.items.length) {
    const firstProduct = products.value.find((row) => row.supplierId === request.supplierId) ?? products.value[0];
    if (firstProduct) {
      request.items = [{ productId: firstProduct.id, qty: 1, price: firstProduct.price }];
    } else {
      request.items = [];
    }
  }
  request.items = request.items.map((item) => {
    const product = productById(item.productId);
    const qty = Number(item.qty) > 0 ? Number(item.qty) : 1;
    return {
      productId: item.productId,
      qty,
      price: product ? product.price : item.price,
    };
  });
  const total = requestTotal(request);
  if (!request.budgetLimit || request.budgetLimit < total) {
    request.budgetLimit = total + 15000;
  }
}

function autoComplete(request: ProcurementRequest): void {
  let guard = 0;
  while (request.status !== 'completed' && guard < 20) {
    guard += 1;
    if (request.status === 'draft' || request.status === 'need_fix') {
      ensureRequestValidForAutoflow(request);
      logEvent(request, 'Подразделение-заказчик', 'Автоисправление заявки', 'Данные приведены к корректному формату');
      submitRequest(request, { silent: true });
      continue;
    }
    if (request.status === 'submitted') {
      runAutoCheck(request, { silent: true });
      continue;
    }
    if (request.status === 'registered') {
      sendOrder(request, { silent: true });
      continue;
    }
    if (request.status === 'order_sent') {
      receiveInvoice(request, { silent: true });
      continue;
    }
    if (request.status === 'invoice_received') {
      payInvoice(request, { silent: true });
      continue;
    }
    if (request.status === 'paid') {
      notifySupplier(request, { silent: true });
      continue;
    }
    if (request.status === 'waiting_delivery') {
      if (isOverdue(request)) {
        sendReminder(request, { silent: true });
      }
      receiveGoods(request, { silent: true });
      continue;
    }
    if (request.status === 'warehouse_received') {
      uploadAct(request, { silent: true });
      continue;
    }
    if (request.status === 'act_uploaded') {
      closeRequest(request, { silent: true });
      continue;
    }
    if (request.status === 'closed') {
      handover(request, { silent: true });
      continue;
    }
  }
  persistState();
  if (request.status === 'completed') {
    $q.notify({ type: 'positive', message: `Автопрогон завершен: ${request.id}` });
  } else {
    $q.notify({ type: 'negative', message: 'Автопрогон остановлен: проверьте данные заявки.' });
  }
}

function stepVisualState(request: ProcurementRequest, stepCode: ProcessStep['code']): StepVisualState {
  const current = STATUS_TO_STEP[request.status] || 1;
  if (request.status === 'need_fix' && stepCode === 'check') {
    return 'error';
  }
  const step = processSteps.find((item) => item.code === stepCode);
  if (!step) {
    return 'pending';
  }
  if (step.index < current) {
    return 'done';
  }
  if (step.index === current) {
    return 'current';
  }
  return 'pending';
}

function stepStateLabel(request: ProcurementRequest, stepCode: ProcessStep['code']): string {
  const state = stepVisualState(request, stepCode);
  if (state === 'done') {
    return 'Выполнено';
  }
  if (state === 'current') {
    return 'Текущий';
  }
  if (state === 'error') {
    return 'Ошибка';
  }
  return 'Ожидается';
}

function stepColor(request: ProcurementRequest, stepCode: ProcessStep['code']): string {
  const state = stepVisualState(request, stepCode);
  if (state === 'done') {
    return 'positive';
  }
  if (state === 'current') {
    return 'primary';
  }
  if (state === 'error') {
    return 'negative';
  }
  return 'grey-6';
}

function stepIcon(request: ProcurementRequest, stepCode: ProcessStep['code']): string {
  const state = stepVisualState(request, stepCode);
  if (state === 'done') {
    return 'check_circle';
  }
  if (state === 'error') {
    return 'error';
  }
  if (state === 'current') {
    return 'play_circle';
  }
  return 'radio_button_unchecked';
}

function laneByKey(laneKey: BpmnLaneKey): BpmnLaneDefinition {
  const found = BPMN_LANES.find((lane) => lane.key === laneKey);
  if (found) {
    return found;
  }
  return {
    key: 'system',
    label: 'ИС',
    y: 146,
    height: 112,
  };
}

function graphNodeClass(kind: BpmnNodeKind): string {
  if (kind === 'task') {
    return 'bpmn-task';
  }
  if (kind === 'gateway') {
    return 'bpmn-gateway';
  }
  return 'bpmn-event';
}

function requestStatusProgress(status: RequestStatus): number {
  const order: Record<RequestStatus, number> = {
    draft: 0,
    submitted: 1,
    need_fix: 1,
    registered: 2,
    order_sent: 3,
    invoice_received: 4,
    paid: 5,
    waiting_delivery: 6,
    warehouse_received: 7,
    act_uploaded: 8,
    closed: 9,
    completed: 10,
  };
  return order[status];
}

function hasFixCycle(request: ProcurementRequest): boolean {
  return request.history.some((entry) => {
    const text = `${entry.action} ${entry.note}`.toLowerCase();
    return text.includes('исправ') || text.includes('доработк');
  });
}

function graphNodeState(request: ProcurementRequest, spec: BpmnGraphNodeSpec): StepVisualState {
  const progress = requestStatusProgress(request.status);

  if (spec.id === 'start') {
    return progress > 0 ? 'done' : 'current';
  }
  if (spec.id === 'end') {
    return request.status === 'completed' ? 'done' : 'pending';
  }
  if (spec.id === 'gw-valid') {
    if (request.status === 'need_fix') {
      return 'error';
    }
    if (request.status === 'submitted') {
      return 'current';
    }
    return progress >= 2 ? 'done' : 'pending';
  }
  if (spec.id === 'fix') {
    if (request.status === 'need_fix') {
      return 'current';
    }
    return hasFixCycle(request) && progress >= 2 ? 'done' : 'pending';
  }
  if (spec.id === 'notify') {
    if (request.status === 'paid') {
      return 'current';
    }
    return progress >= 6 ? 'done' : 'pending';
  }
  if (spec.id === 'gw-delay') {
    if (request.status === 'waiting_delivery') {
      return 'current';
    }
    return progress >= 7 ? 'done' : 'pending';
  }
  if (spec.id === 'reminder') {
    if (request.reminderCount > 0) {
      return 'done';
    }
    if (request.status === 'waiting_delivery' && isOverdue(request)) {
      return 'current';
    }
    return 'pending';
  }
  if (!spec.stepCode) {
    return 'pending';
  }
  return stepVisualState(request, spec.stepCode);
}

function graphEdgeState(request: ProcurementRequest, sourceNodeId: string): StepVisualState {
  const spec = BPMN_GRAPH_NODE_SPECS.find((node) => node.id === sourceNodeId);
  if (!spec) {
    return 'pending';
  }
  return graphNodeState(request, spec);
}

function graphNodeStyle(kind: BpmnNodeKind, state: StepVisualState): Record<string, string> {
  const palette: Record<StepVisualState, { border: string; bg: string; text: string; shadow: string }> = {
    done: {
      border: '#2e8b57',
      bg: 'linear-gradient(160deg, #f2fff6, #e9f8ee)',
      text: '#1d2d23',
      shadow: '0 5px 14px rgba(46, 139, 87, 0.14)',
    },
    current: {
      border: '#0f5964',
      bg: 'linear-gradient(160deg, #e8f5f7, #d9edf1)',
      text: '#193139',
      shadow: '0 5px 14px rgba(15, 89, 100, 0.2)',
    },
    error: {
      border: '#c0392b',
      bg: 'linear-gradient(160deg, #fff1ef, #ffe5e1)',
      text: '#451b16',
      shadow: '0 5px 14px rgba(192, 57, 43, 0.2)',
    },
    pending: {
      border: '#b0bec5',
      bg: 'linear-gradient(160deg, #ffffff, #f2f4f5)',
      text: '#455a64',
      shadow: '0 3px 10px rgba(84, 101, 112, 0.12)',
    },
  };
  const currentPalette = palette[state];

  if (kind === 'event-start' || kind === 'event-end') {
    return {
      width: '74px',
      height: '74px',
      border: `3px solid ${currentPalette.border}`,
      borderRadius: '50%',
      background: currentPalette.bg,
      color: currentPalette.text,
      boxShadow: currentPalette.shadow,
      fontWeight: state === 'current' ? '700' : '600',
      fontSize: '12px',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
    };
  }

  if (kind === 'gateway') {
    return {
      width: '136px',
      minHeight: '60px',
      border: `2px dashed ${currentPalette.border}`,
      borderRadius: '10px',
      background: currentPalette.bg,
      color: currentPalette.text,
      boxShadow: currentPalette.shadow,
      fontWeight: state === 'current' ? '700' : '600',
      fontSize: '12px',
      textAlign: 'center',
      padding: '10px 8px',
    };
  }

  return {
    width: '196px',
    minHeight: '66px',
    border: `2px solid ${currentPalette.border}`,
    borderRadius: '10px',
    background: currentPalette.bg,
    color: currentPalette.text,
    boxShadow: currentPalette.shadow,
    fontWeight: state === 'current' ? '700' : '600',
    fontSize: '12px',
    textAlign: 'left',
    padding: '9px 11px',
    lineHeight: '1.25',
  };
}

function graphEdgeStyle(state: StepVisualState, dashed = false): Record<string, string | number> {
  const base = dashed ? { strokeDasharray: '6 5' } : {};
  if (state === 'done') {
    return { ...base, stroke: '#2e8b57', strokeWidth: 2.3 };
  }
  if (state === 'current') {
    return { ...base, stroke: '#0f5964', strokeWidth: 2.6 };
  }
  if (state === 'error') {
    return { ...base, stroke: '#c0392b', strokeWidth: 2.5 };
  }
  return { ...base, stroke: '#90a4ae', strokeWidth: 2 };
}

onMounted(() => {
  initData();
});
</script>

<style scoped lang="scss">
.app-bg {
  min-height: 100vh;
}

.header-shell {
  background: linear-gradient(120deg, #0f5964, #167380);
  box-shadow: 0 8px 20px rgba(8, 33, 37, 0.26);
  border-radius: 14px;
}

.header-sticky {
  position: sticky;
  top: 8px;
  z-index: 30;
  backdrop-filter: blur(2px);
}

.header-caption {
  color: rgba(255, 255, 255, 0.82);
  letter-spacing: 0.1px;
}

.panel-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 89, 100, 0.12);
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(22, 36, 44, 0.08);
}

.stat-card {
  border-radius: 14px;
  border: 1px solid rgba(245, 154, 35, 0.28);
  background:
    linear-gradient(155deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 238, 0.9)),
    radial-gradient(circle at 90% 0%, rgba(245, 154, 35, 0.16), transparent 42%);
  box-shadow: 0 9px 22px rgba(22, 36, 44, 0.07);
}

.dialog-card {
  width: min(980px, 94vw);
  max-height: 94vh;
  overflow: auto;
  border-radius: 14px;
}

.process-graph-wrap {
  position: relative;
  height: 700px;
  border: 1px solid rgba(15, 89, 100, 0.2);
  border-radius: 12px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(239, 248, 247, 0.8), rgba(253, 250, 242, 0.85));
}

:deep(.process-flow-canvas) {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.bpmn-lanes-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.bpmn-lane-row {
  position: absolute;
  left: 14px;
  right: 14px;
  border: 1px solid rgba(15, 89, 100, 0.18);
  border-radius: 10px;
  background: linear-gradient(160deg, rgba(248, 253, 253, 0.88), rgba(238, 248, 248, 0.88));
}

.bpmn-lane-row:nth-child(even) {
  background: linear-gradient(160deg, rgba(255, 252, 247, 0.88), rgba(251, 245, 236, 0.88));
}

.bpmn-lane-title {
  position: absolute;
  top: 7px;
  left: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #23414a;
}

:deep(.vue-flow__node-default) {
  white-space: normal;
  line-height: 1.3;
  text-align: left;
}

:deep(.vue-flow__node.bpmn-task) {
  white-space: normal;
}

:deep(.vue-flow__node.bpmn-gateway) {
  white-space: normal;
}

:deep(.vue-flow__node.bpmn-event) {
  white-space: nowrap;
}

:deep(.vue-flow__edge-text) {
  fill: #26424a;
  font-size: 11px;
  font-weight: 600;
}

:deep(.vue-flow__handle) {
  opacity: 0;
  pointer-events: none;
}

:deep(.vue-flow__pane) {
  cursor: grab;
}

:deep(.vue-flow__pane.dragging) {
  cursor: grabbing;
}

.fade-in {
  animation: fadeUp 0.35s ease-out;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .process-graph-wrap {
    height: 520px;
  }
}
</style>
