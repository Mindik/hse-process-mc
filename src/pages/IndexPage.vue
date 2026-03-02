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
        <q-tab name="blacklist" label="Черный список" icon="gpp_bad" />
        <q-tab name="limits" label="Лимиты" icon="rule" />
        <q-tab name="report" label="Отчет руководителя" icon="analytics" />
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
                <VueFlow
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
          <div class="col-12 col-md-5 text-right text-caption text-grey-7">
            Администрирование каталога поставщиков.
          </div>
          <div class="col-12 col-md-3 text-right">
            <q-btn color="primary" icon="add_business" label="Новый поставщик" @click="openCreateSupplierDialog" />
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
          <template #body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                @click="openEditSupplierDialog(props.row)"
              />
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="deleteSupplier(props.row)"
              />
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
          <div class="col-12 col-md-2 text-right text-caption text-grey-7">
            Администрирование каталога товаров.
          </div>
          <div class="col-12 col-md-2 text-right">
            <q-btn color="primary" icon="add_box" label="Новый товар" @click="openCreateProductDialog" />
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
          <template #body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                @click="openEditProductDialog(props.row)"
              />
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="deleteProduct(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <div v-else-if="activeTab === 'blacklist'" class="fade-in">
      <q-card class="panel-card">
        <q-card-section class="row q-col-gutter-sm items-center">
          <div class="col-12 col-md-4">
            <q-input v-model.trim="blackListSearch" dense outlined label="Поиск по черному списку" clearable>
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-5 text-right text-caption text-grey-7">
            Регистр сведений: блокировка проблемных поставщиков.
          </div>
          <div class="col-12 col-md-3 text-right">
            <q-btn color="negative" icon="add_moderator" label="Новая запись" @click="openCreateBlacklistDialog" />
          </div>
        </q-card-section>
        <q-separator />
        <q-table
          flat
          row-key="id"
          :rows="filteredBlackList"
          :columns="blackListColumns"
          :pagination="{ rowsPerPage: 8 }"
        >
          <template #body-cell-supplier="props">
            <q-td :props="props">{{ supplierName(props.row.supplierId) }}</q-td>
          </template>
          <template #body-cell-dateAdded="props">
            <q-td :props="props">{{ formatDate(props.row.dateAdded) }}</q-td>
          </template>
          <template #body-cell-active="props">
            <q-td :props="props">
              <q-chip dense :color="props.row.active ? 'negative' : 'grey-6'" text-color="white">
                {{ props.row.active ? 'Активна' : 'Отключена' }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn flat round dense icon="edit" color="primary" @click="openEditBlacklistDialog(props.row)" />
              <q-btn flat round dense icon="delete" color="negative" @click="deleteBlacklistEntry(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <div v-else-if="activeTab === 'limits'" class="fade-in">
      <q-card class="panel-card">
        <q-card-section class="row q-col-gutter-sm items-center">
          <div class="col-12 col-md-4">
            <q-input v-model.trim="limitSearch" dense outlined label="Поиск по лимитам" clearable>
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-5 text-right text-caption text-grey-7">
            Регистр сведений: лимиты согласования по подразделениям.
          </div>
          <div class="col-12 col-md-3 text-right">
            <q-btn color="primary" icon="add_chart" label="Новый лимит" @click="openCreateLimitDialog" />
          </div>
        </q-card-section>
        <q-separator />
        <q-table
          flat
          row-key="id"
          :rows="filteredLimits"
          :columns="limitColumns"
          :pagination="{ rowsPerPage: 8 }"
        >
          <template #body-cell-amount="props">
            <q-td :props="props">{{ formatMoney(props.row.amount) }}</q-td>
          </template>
          <template #body-cell-active="props">
            <q-td :props="props">
              <q-chip dense :color="props.row.active ? 'positive' : 'grey-6'" text-color="white">
                {{ props.row.active ? 'Действует' : 'Отключен' }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn flat round dense icon="edit" color="primary" @click="openEditLimitDialog(props.row)" />
              <q-btn flat round dense icon="delete" color="negative" @click="deleteLimit(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <div v-else-if="activeTab === 'report'" class="fade-in">
      <div class="row q-col-gutter-md q-mb-md">
        <div v-for="card in reportCards" :key="card.key" class="col-12 col-sm-6 col-lg-3">
          <q-card class="stat-card">
            <q-card-section>
              <div class="text-caption">{{ card.label }}</div>
              <div class="text-h4 text-weight-bold">{{ card.value }}</div>
              <div class="text-caption text-grey-7">{{ card.caption }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <q-card class="panel-card">
        <q-card-section class="row q-col-gutter-sm items-center">
          <div class="col-12 col-md-5">
            <q-input
              v-model.trim="reportSearch"
              dense
              outlined
              label="Поиск в отчете"
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
              v-model="reportStatusFilter"
              dense
              outlined
              emit-value
              map-options
              :options="reportStatusOptions"
              label="Профиль статусов"
            />
          </div>
          <div class="col-12 col-md-3 text-right text-caption text-grey-7">
            Заявки для оперативного управленческого контроля.
          </div>
        </q-card-section>
        <q-separator />
        <q-table
          flat
          row-key="id"
          :rows="managementRows"
          :columns="reportColumns"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-id="props">
            <q-td :props="props">
              <q-btn flat dense no-caps color="primary" :label="props.row.id" @click="openRequestFromReport(props.row.id)" />
            </q-td>
          </template>
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-chip dense :color="statusColor(props.row.status)" text-color="white">
                {{ statusLabel(props.row.status) }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-total="props">
            <q-td :props="props">{{ formatMoney(props.row.total) }}</q-td>
          </template>
          <template #body-cell-overdue="props">
            <q-td :props="props">
              <q-chip dense :color="props.row.overdue ? 'negative' : 'positive'" text-color="white">
                {{ props.row.overdue ? 'Просрочка' : 'В норме' }}
              </q-chip>
            </q-td>
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

    <q-dialog v-model="supplierDialog.open" persistent>
      <q-card class="dialog-card admin-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ supplierDialog.isEdit ? 'Редактирование поставщика' : 'Новый поставщик' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model.trim="supplierForm.name" outlined dense label="Наименование *" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model.trim="supplierForm.inn" outlined dense label="ИНН *" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model.trim="supplierForm.city" outlined dense label="Город *" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model.trim="supplierForm.email" outlined dense label="Email *" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model.trim="supplierForm.phone" outlined dense label="Телефон *" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model.trim="supplierForm.category" outlined dense label="Категория *" />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="supplierForm.leadTimeDays"
                outlined
                dense
                type="number"
                min="1"
                label="Срок поставки, дн *"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model.number="supplierForm.rating"
                outlined
                dense
                emit-value
                map-options
                :options="ratingOptions"
                label="Рейтинг *"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="grey-8" v-close-popup />
          <q-btn color="primary" label="Сохранить" @click="saveSupplierFromDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="productDialog.open" persistent>
      <q-card class="dialog-card admin-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ productDialog.isEdit ? 'Редактирование товара' : 'Новый товар' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model.trim="productForm.name" outlined dense label="Наименование *" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model.trim="productForm.sku" outlined dense label="Артикул *" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model.trim="productForm.unit" outlined dense label="Ед. изм. *" />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="productForm.supplierId"
                outlined
                dense
                emit-value
                map-options
                :options="supplierOptions"
                label="Поставщик *"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model.trim="productForm.category" outlined dense label="Категория *" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model.number="productForm.price" outlined dense type="number" min="1" label="Цена, ₽ *" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model.number="productForm.stock" outlined dense type="number" min="0" label="Остаток *" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="grey-8" v-close-popup />
          <q-btn color="primary" label="Сохранить" @click="saveProductFromDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="blackListDialog.open" persistent>
      <q-card class="dialog-card admin-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ blackListDialog.isEdit ? 'Редактирование записи' : 'Новая запись черного списка' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="blackListForm.supplierId"
                outlined
                dense
                emit-value
                map-options
                :options="supplierOptions"
                label="Поставщик *"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="blackListForm.dateAdded" outlined dense type="date" label="Дата внесения *" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model.trim="blackListForm.addedBy" outlined dense label="Кем внесено *" />
            </div>
            <div class="col-12">
              <q-input v-model.trim="blackListForm.reason" outlined dense autogrow type="textarea" label="Причина *" />
            </div>
            <div class="col-12">
              <q-toggle v-model="blackListForm.active" color="negative" label="Запись активна" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="grey-8" v-close-popup />
          <q-btn color="primary" label="Сохранить" @click="saveBlacklistFromDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="limitDialog.open" persistent>
      <q-card class="dialog-card admin-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ limitDialog.isEdit ? 'Редактирование лимита' : 'Новый лимит согласования' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model.trim="limitForm.department" outlined dense label="Подразделение *" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model.number="limitForm.amount" outlined dense type="number" min="1" label="Лимит, ₽ *" />
            </div>
            <div class="col-12 col-md-3">
              <q-input :model-value="limitForm.currency" outlined dense label="Валюта" readonly />
            </div>
            <div class="col-12">
              <q-input v-model.trim="limitForm.approver" outlined dense label="Согласующий *" />
            </div>
            <div class="col-12">
              <q-input v-model.trim="limitForm.comment" outlined dense autogrow type="textarea" label="Комментарий" />
            </div>
            <div class="col-12">
              <q-toggle v-model="limitForm.active" color="primary" label="Лимит действует" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="grey-8" v-close-popup />
          <q-btn color="primary" label="Сохранить" @click="saveLimitFromDialog" />
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
  type ApprovalLimit,
  type BlacklistEntry,
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

type ActiveTab =
  | 'process'
  | 'suppliers'
  | 'products'
  | 'blacklist'
  | 'limits'
  | 'report'
  | 'guide';
type ProcessViewMode = 'graph' | 'list';
type StatusFilter = 'all' | RequestStatus;
type ProductSupplierFilter = 'all' | number;
type ReportStatusFilter = 'all' | 'attention' | RequestStatus;
type ActionKey =
  | 'edit'
  | 'submit'
  | 'runCheck'
  | 'approveRequest'
  | 'rejectRequest'
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

interface SupplierDialogState {
  open: boolean;
  isEdit: boolean;
  supplierId: number | null;
}

interface ProductDialogState {
  open: boolean;
  isEdit: boolean;
  productId: number | null;
}

interface BlacklistDialogState {
  open: boolean;
  isEdit: boolean;
  entryId: number | null;
}

interface LimitDialogState {
  open: boolean;
  isEdit: boolean;
  limitId: number | null;
}

interface SupplierFormState {
  name: string;
  city: string;
  inn: string;
  email: string;
  phone: string;
  leadTimeDays: number;
  rating: number;
  category: string;
}

interface ProductFormState {
  supplierId: number | null;
  name: string;
  unit: string;
  price: number;
  stock: number;
  sku: string;
  category: string;
}

interface BlacklistFormState {
  supplierId: number | null;
  reason: string;
  dateAdded: string;
  addedBy: string;
  active: boolean;
}

interface LimitFormState {
  department: string;
  amount: number;
  currency: 'RUB';
  approver: string;
  active: boolean;
  comment: string;
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

interface ManagementRow {
  id: string;
  department: string;
  supplier: string;
  status: RequestStatus;
  total: number;
  responsibleRole: string;
  daysInStatus: number;
  overdue: boolean;
  updatedAt: string;
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

const STORAGE_KEY = 'mk-procurement-prototype-v4';

const $q = useQuasar();

const activeTab = ref<ActiveTab>('process');
const processViewMode = ref<ProcessViewMode>('graph');
const currentRole = ref<UserRole>('requester');
const requestSearch = ref('');
const statusFilter = ref<StatusFilter>('all');
const supplierSearch = ref('');
const productSearch = ref('');
const productSupplierFilter = ref<ProductSupplierFilter>('all');
const blackListSearch = ref('');
const limitSearch = ref('');
const reportSearch = ref('');
const reportStatusFilter = ref<ReportStatusFilter>('attention');

const suppliers = ref<Supplier[]>([]);
const products = ref<Product[]>([]);
const requests = ref<ProcurementRequest[]>([]);
const blackList = ref<BlacklistEntry[]>([]);
const approvalLimits = ref<ApprovalLimit[]>([]);
const selectedRequestId = ref<string | null>(null);

const requestDialog = ref<RequestDialogState>({
  open: false,
  isEdit: false,
  requestId: null,
});
const form = ref<RequestFormState>(emptyFormState());
const supplierDialog = ref<SupplierDialogState>({
  open: false,
  isEdit: false,
  supplierId: null,
});
const productDialog = ref<ProductDialogState>({
  open: false,
  isEdit: false,
  productId: null,
});
const blackListDialog = ref<BlacklistDialogState>({
  open: false,
  isEdit: false,
  entryId: null,
});
const limitDialog = ref<LimitDialogState>({
  open: false,
  isEdit: false,
  limitId: null,
});
const supplierForm = ref<SupplierFormState>({
  name: '',
  city: '',
  inn: '',
  email: '',
  phone: '',
  leadTimeDays: 3,
  rating: 4,
  category: '',
});
const productForm = ref<ProductFormState>({
  supplierId: null,
  name: '',
  unit: 'шт',
  price: 0,
  stock: 0,
  sku: '',
  category: '',
});
const blackListForm = ref<BlacklistFormState>({
  supplierId: null,
  reason: '',
  dateAdded: formatIsoDate(new Date()),
  addedBy: '',
  active: true,
});
const limitForm = ref<LimitFormState>({
  department: '',
  amount: 0,
  currency: 'RUB',
  approver: '',
  active: true,
  comment: '',
});

const roleOptions: Option<UserRole>[] = [
  { label: 'Подразделение-заказчик', value: 'requester' },
  { label: 'Руководитель', value: 'manager' },
  { label: 'Отдел снабжения', value: 'supply' },
  { label: 'Бухгалтерия', value: 'accounting' },
  { label: 'Склад', value: 'warehouse' },
  { label: 'ИС (автодействия)', value: 'system' },
];

const processViewOptions: Option<ProcessViewMode>[] = [
  { label: 'Граф', value: 'graph' },
  { label: 'Список', value: 'list' },
];

const ratingOptions: Option<number>[] = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
];

const BPMN_LANES: BpmnLaneDefinition[] = [
  { key: 'requester', label: 'Подразделение-заказчик', y: 20, height: 112 },
  { key: 'system', label: 'ИС', y: 146, height: 112 },
  { key: 'supply', label: 'Отдел снабжения', y: 272, height: 112 },
  { key: 'accounting', label: 'Бухгалтерия', y: 398, height: 112 },
  { key: 'warehouse', label: 'Склад', y: 524, height: 112 },
];

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
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

const productColumns: QTableColumn<Product>[] = [
  { name: 'name', label: 'Товар', field: 'name', align: 'left', sortable: true },
  { name: 'supplier', label: 'Поставщик', field: 'supplierId', align: 'left' },
  { name: 'category', label: 'Категория', field: 'category', align: 'left' },
  { name: 'sku', label: 'Артикул', field: 'sku', align: 'left' },
  { name: 'price', label: 'Цена', field: 'price', align: 'right', sortable: true },
  { name: 'stock', label: 'Остаток', field: 'stock', align: 'right', sortable: true },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

const blackListColumns: QTableColumn<BlacklistEntry>[] = [
  { name: 'supplier', label: 'Поставщик', field: 'supplierId', align: 'left' },
  { name: 'reason', label: 'Причина', field: 'reason', align: 'left' },
  { name: 'dateAdded', label: 'Дата внесения', field: 'dateAdded', align: 'left', sortable: true },
  { name: 'addedBy', label: 'Кем внесен', field: 'addedBy', align: 'left' },
  { name: 'active', label: 'Статус', field: 'active', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

const limitColumns: QTableColumn<ApprovalLimit>[] = [
  { name: 'department', label: 'Подразделение', field: 'department', align: 'left', sortable: true },
  { name: 'amount', label: 'Лимит', field: 'amount', align: 'right', sortable: true },
  { name: 'approver', label: 'Согласующий', field: 'approver', align: 'left' },
  { name: 'comment', label: 'Комментарий', field: 'comment', align: 'left' },
  { name: 'active', label: 'Статус', field: 'active', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

const reportColumns: QTableColumn<ManagementRow>[] = [
  { name: 'id', label: 'Заявка', field: 'id', align: 'left', sortable: true },
  { name: 'department', label: 'Подразделение', field: 'department', align: 'left', sortable: true },
  { name: 'supplier', label: 'Поставщик', field: 'supplier', align: 'left' },
  { name: 'status', label: 'Статус', field: 'status', align: 'left', sortable: true },
  { name: 'responsibleRole', label: 'Ожидаемая роль', field: 'responsibleRole', align: 'left' },
  { name: 'total', label: 'Сумма', field: 'total', align: 'right', sortable: true },
  { name: 'daysInStatus', label: 'Дней в статусе', field: 'daysInStatus', align: 'right', sortable: true },
  { name: 'overdue', label: 'SLA', field: 'overdue', align: 'left', sortable: true },
];

const statusOptions = computed<Option<StatusFilter>[]>(() => {
  const all: Option<StatusFilter> = { label: 'Все статусы', value: 'all' };
  const statuses = (Object.keys(statusMeta) as RequestStatus[]).map((status) => ({
    label: statusMeta[status].label,
    value: status,
  }));
  return [all, ...statuses];
});

const reportStatusOptions = computed<Option<ReportStatusFilter>[]>(() => [
  { label: 'Только требующие внимания', value: 'attention' },
  { label: 'Все статусы', value: 'all' },
  ...(Object.keys(statusMeta) as RequestStatus[]).map((status) => ({
    label: statusMeta[status].label,
    value: status,
  })),
]);

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

const filteredBlackList = computed<BlacklistEntry[]>(() => {
  const search = blackListSearch.value.toLowerCase();
  return blackList.value
    .filter((entry) => {
      if (!search) {
        return true;
      }
      return (
        supplierName(entry.supplierId).toLowerCase().includes(search) ||
        entry.reason.toLowerCase().includes(search) ||
        entry.addedBy.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
});

const filteredLimits = computed<ApprovalLimit[]>(() => {
  const search = limitSearch.value.toLowerCase();
  return approvalLimits.value
    .filter((row) => {
      if (!search) {
        return true;
      }
      return (
        row.department.toLowerCase().includes(search) ||
        row.approver.toLowerCase().includes(search) ||
        row.comment.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => a.department.localeCompare(b.department, 'ru'));
});

const managementRows = computed<ManagementRow[]>(() =>
  requests.value
    .map((request) => ({
      id: request.id,
      department: request.department,
      supplier: supplierName(request.supplierId),
      status: request.status,
      total: requestTotal(request),
      responsibleRole: expectedRoleLabel(request),
      daysInStatus: daysInCurrentStatus(request),
      overdue: isOverdue(request),
      updatedAt: request.updatedAt,
    }))
    .filter((row) => {
      if (reportStatusFilter.value === 'all') {
        return true;
      }
      if (reportStatusFilter.value === 'attention') {
        return row.status === 'pending_approval' || row.status === 'submitted' || row.overdue;
      }
      return row.status === reportStatusFilter.value;
    })
    .filter((row) => {
      const search = reportSearch.value.trim().toLowerCase();
      if (!search) {
        return true;
      }
      return (
        row.id.toLowerCase().includes(search) ||
        row.department.toLowerCase().includes(search) ||
        row.supplier.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => b.daysInStatus - a.daysInStatus),
);

const reportCards = computed<DashboardCard[]>(() => {
  const inWork = requests.value.filter((row) => row.status !== 'completed' && row.status !== 'rejected').length;
  const pendingApproval = requests.value.filter((row) => row.status === 'pending_approval').length;
  const overdue = requests.value.filter((row) => isOverdue(row)).length;
  const autoApproved = requests.value.filter((row) =>
    row.history.some((entry) => entry.action.toLowerCase().includes('автоодобр')),
  ).length;
  return [
    { key: 'rw-in-work', label: 'В работе', value: inWork, caption: 'активные заявки' },
    { key: 'rw-approval', label: 'Ожидают решения', value: pendingApproval, caption: 'нужна роль руководителя' },
    { key: 'rw-overdue', label: 'Просрочка SLA', value: overdue, caption: 'требуется реакция снабжения' },
    { key: 'rw-auto', label: 'Автоодобрено', value: autoApproved, caption: 'по правилам DMN' },
  ];
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

  const laneNodes: Node[] = BPMN_LANES.map((lane, index) => ({
    id: `lane-${lane.key}`,
    position: { x: 14, y: lane.y },
    draggable: false,
    selectable: false,
    connectable: false,
    class: 'bpmn-lane',
    data: { label: lane.label },
    style: graphLaneStyle(index),
    zIndex: 0,
  }));

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
      zIndex: 20,
    } satisfies Node;
  });

  return [...laneNodes, ...flowNodes];
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
      zIndex: 10,
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
    blackList: blackList.value,
    approvalLimits: approvalLimits.value,
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
        blackList?: BlacklistEntry[];
        approvalLimits?: ApprovalLimit[];
        selectedRequestId?: string | null;
      };
      if (Array.isArray(parsed.suppliers) && Array.isArray(parsed.products) && Array.isArray(parsed.requests)) {
        const defaults = createDemoState();
        suppliers.value = parsed.suppliers;
        products.value = parsed.products;
        requests.value = parsed.requests;
        blackList.value = Array.isArray(parsed.blackList) ? parsed.blackList : defaults.blackList;
        approvalLimits.value = Array.isArray(parsed.approvalLimits)
          ? parsed.approvalLimits
          : defaults.approvalLimits;
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
  blackList.value = demo.blackList;
  approvalLimits.value = demo.approvalLimits;
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
    blackList.value = demo.blackList;
    approvalLimits.value = demo.approvalLimits;
    selectedRequestId.value = demo.selectedRequestId;
    persistState();
    $q.notify({ type: 'positive', message: 'Демо-данные восстановлены.' });
  });
}

function onRequestRowClick(_evt: Event, row: ProcurementRequest): void {
  selectedRequestId.value = row.id;
  persistState();
}

function openRequestFromReport(requestId: string): void {
  selectedRequestId.value = requestId;
  activeTab.value = 'process';
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

function emptySupplierForm(): SupplierFormState {
  return {
    name: '',
    city: '',
    inn: '',
    email: '',
    phone: '',
    leadTimeDays: 3,
    rating: 4,
    category: '',
  };
}

function emptyProductForm(): ProductFormState {
  return {
    supplierId: null,
    name: '',
    unit: 'шт',
    price: 0,
    stock: 0,
    sku: '',
    category: '',
  };
}

function generateSupplierId(): number {
  return suppliers.value.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function generateProductId(): number {
  return products.value.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function openCreateSupplierDialog(): void {
  supplierDialog.value.open = true;
  supplierDialog.value.isEdit = false;
  supplierDialog.value.supplierId = null;
  supplierForm.value = emptySupplierForm();
}

function openEditSupplierDialog(supplier: Supplier): void {
  supplierDialog.value.open = true;
  supplierDialog.value.isEdit = true;
  supplierDialog.value.supplierId = supplier.id;
  supplierForm.value = {
    name: supplier.name,
    city: supplier.city,
    inn: supplier.inn,
    email: supplier.email,
    phone: supplier.phone,
    leadTimeDays: supplier.leadTimeDays,
    rating: supplier.rating,
    category: supplier.category,
  };
}

function validateSupplierForm(excludeId: number | null): string | null {
  const formData = supplierForm.value;
  if (
    !formData.name.trim() ||
    !formData.city.trim() ||
    !formData.inn.trim() ||
    !formData.email.trim() ||
    !formData.phone.trim() ||
    !formData.category.trim()
  ) {
    return 'Заполните все обязательные поля поставщика.';
  }
  if (!/^\d{10}$|^\d{12}$/.test(formData.inn.trim())) {
    return 'ИНН должен содержать 10 или 12 цифр.';
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email.trim())) {
    return 'Укажите корректный email.';
  }
  if (!formData.leadTimeDays || formData.leadTimeDays < 1) {
    return 'Срок поставки должен быть не меньше 1 дня.';
  }
  if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
    return 'Рейтинг должен быть в диапазоне 1..5.';
  }

  const duplicateInn = suppliers.value.find(
    (item) => item.inn === formData.inn.trim() && item.id !== excludeId,
  );
  if (duplicateInn) {
    return 'Поставщик с таким ИНН уже существует.';
  }

  return null;
}

function saveSupplierFromDialog(): void {
  const error = validateSupplierForm(supplierDialog.value.isEdit ? supplierDialog.value.supplierId : null);
  if (error) {
    $q.notify({ type: 'negative', message: error });
    return;
  }

  const payload = {
    name: supplierForm.value.name.trim(),
    city: supplierForm.value.city.trim(),
    inn: supplierForm.value.inn.trim(),
    email: supplierForm.value.email.trim(),
    phone: supplierForm.value.phone.trim(),
    leadTimeDays: Number(supplierForm.value.leadTimeDays),
    rating: Number(supplierForm.value.rating),
    category: supplierForm.value.category.trim(),
  };

  if (supplierDialog.value.isEdit) {
    const supplier = suppliers.value.find((row) => row.id === supplierDialog.value.supplierId);
    if (!supplier) {
      $q.notify({ type: 'negative', message: 'Поставщик не найден.' });
      return;
    }
    Object.assign(supplier, payload);
  } else {
    suppliers.value.push({
      id: generateSupplierId(),
      ...payload,
    });
  }

  persistState();
  supplierDialog.value.open = false;
  $q.notify({ type: 'positive', message: 'Поставщик сохранен.' });
}

function deleteSupplier(supplier: Supplier): void {
  const hasRequests = requests.value.some((request) => request.supplierId === supplier.id);
  if (hasRequests) {
    $q.notify({
      type: 'negative',
      message: 'Нельзя удалить поставщика, он используется в заявках.',
    });
    return;
  }
  const hasProducts = products.value.some((product) => product.supplierId === supplier.id);
  if (hasProducts) {
    $q.notify({
      type: 'negative',
      message: 'Сначала удалите или перенесите товары этого поставщика.',
    });
    return;
  }
  const hasBlackListEntry = blackList.value.some((entry) => entry.supplierId === supplier.id);
  if (hasBlackListEntry) {
    $q.notify({
      type: 'negative',
      message: 'Сначала удалите записи этого поставщика из черного списка.',
    });
    return;
  }

  $q.dialog({
    title: 'Удаление поставщика',
    message: `Удалить "${supplier.name}"?`,
    persistent: true,
    ok: { label: 'Удалить', color: 'negative' },
    cancel: { label: 'Отмена', flat: true },
  }).onOk(() => {
    suppliers.value = suppliers.value.filter((row) => row.id !== supplier.id);
    if (productSupplierFilter.value === supplier.id) {
      productSupplierFilter.value = 'all';
    }
    persistState();
    $q.notify({ type: 'positive', message: 'Поставщик удален.' });
  });
}

function openCreateProductDialog(): void {
  if (!suppliers.value.length) {
    $q.notify({ type: 'warning', message: 'Сначала добавьте хотя бы одного поставщика.' });
    return;
  }
  productDialog.value.open = true;
  productDialog.value.isEdit = false;
  productDialog.value.productId = null;
  const initialSupplier =
    typeof productSupplierFilter.value === 'number'
      ? productSupplierFilter.value
      : (suppliers.value[0]?.id ?? null);
  productForm.value = {
    ...emptyProductForm(),
    supplierId: initialSupplier,
  };
}

function openEditProductDialog(product: Product): void {
  productDialog.value.open = true;
  productDialog.value.isEdit = true;
  productDialog.value.productId = product.id;
  productForm.value = {
    supplierId: product.supplierId,
    name: product.name,
    unit: product.unit,
    price: product.price,
    stock: product.stock,
    sku: product.sku,
    category: product.category,
  };
}

function validateProductForm(excludeId: number | null): string | null {
  const formData = productForm.value;
  if (
    !formData.name.trim() ||
    !formData.sku.trim() ||
    !formData.unit.trim() ||
    !formData.category.trim() ||
    !formData.supplierId
  ) {
    return 'Заполните все обязательные поля товара.';
  }
  if (!formData.price || formData.price <= 0) {
    return 'Цена должна быть больше 0.';
  }
  if (formData.stock < 0) {
    return 'Остаток не может быть отрицательным.';
  }

  const duplicateSku = products.value.find(
    (item) => item.sku.toLowerCase() === formData.sku.trim().toLowerCase() && item.id !== excludeId,
  );
  if (duplicateSku) {
    return 'Товар с таким артикулом уже существует.';
  }
  return null;
}

function saveProductFromDialog(): void {
  const error = validateProductForm(productDialog.value.isEdit ? productDialog.value.productId : null);
  if (error) {
    $q.notify({ type: 'negative', message: error });
    return;
  }

  const payload = {
    supplierId: Number(productForm.value.supplierId),
    name: productForm.value.name.trim(),
    unit: productForm.value.unit.trim(),
    price: Number(productForm.value.price),
    stock: Number(productForm.value.stock),
    sku: productForm.value.sku.trim(),
    category: productForm.value.category.trim(),
  };

  if (productDialog.value.isEdit) {
    const product = products.value.find((row) => row.id === productDialog.value.productId);
    if (!product) {
      $q.notify({ type: 'negative', message: 'Товар не найден.' });
      return;
    }
    Object.assign(product, payload);
  } else {
    products.value.push({
      id: generateProductId(),
      ...payload,
    });
  }

  persistState();
  productDialog.value.open = false;
  $q.notify({ type: 'positive', message: 'Товар сохранен.' });
}

function deleteProduct(product: Product): void {
  const usedInRequests = requests.value.some((request) =>
    request.items.some((item) => item.productId === product.id),
  );
  if (usedInRequests) {
    $q.notify({
      type: 'negative',
      message: 'Нельзя удалить товар, он уже используется в заявках.',
    });
    return;
  }

  $q.dialog({
    title: 'Удаление товара',
    message: `Удалить "${product.name}"?`,
    persistent: true,
    ok: { label: 'Удалить', color: 'negative' },
    cancel: { label: 'Отмена', flat: true },
  }).onOk(() => {
    products.value = products.value.filter((row) => row.id !== product.id);
    form.value.items = form.value.items.map((item) =>
      item.productId === product.id
        ? {
            ...item,
            productId: null,
          }
        : item,
    );
    persistState();
    $q.notify({ type: 'positive', message: 'Товар удален.' });
  });
}

function emptyBlacklistForm(): BlacklistFormState {
  return {
    supplierId: null,
    reason: '',
    dateAdded: formatIsoDate(new Date()),
    addedBy: '',
    active: true,
  };
}

function emptyLimitForm(): LimitFormState {
  return {
    department: '',
    amount: 0,
    currency: 'RUB',
    approver: '',
    active: true,
    comment: '',
  };
}

function generateBlacklistId(): number {
  return blackList.value.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

function generateLimitId(): number {
  return approvalLimits.value.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

function openCreateBlacklistDialog(): void {
  if (!suppliers.value.length) {
    $q.notify({ type: 'warning', message: 'Сначала добавьте поставщиков.' });
    return;
  }
  blackListDialog.value = { open: true, isEdit: false, entryId: null };
  blackListForm.value = emptyBlacklistForm();
}

function openEditBlacklistDialog(entry: BlacklistEntry): void {
  blackListDialog.value = { open: true, isEdit: true, entryId: entry.id };
  blackListForm.value = {
    supplierId: entry.supplierId,
    reason: entry.reason,
    dateAdded: entry.dateAdded,
    addedBy: entry.addedBy,
    active: entry.active,
  };
}

function saveBlacklistFromDialog(): void {
  if (!blackListForm.value.supplierId || !blackListForm.value.reason.trim() || !blackListForm.value.addedBy.trim()) {
    $q.notify({ type: 'negative', message: 'Заполните поставщика, причину и автора записи.' });
    return;
  }
  const duplicate = blackList.value.find(
    (row) =>
      row.supplierId === blackListForm.value.supplierId &&
      row.active &&
      row.id !== blackListDialog.value.entryId,
  );
  if (duplicate) {
    $q.notify({ type: 'negative', message: 'Для этого поставщика уже есть активная запись черного списка.' });
    return;
  }

  const payload = {
    supplierId: Number(blackListForm.value.supplierId),
    reason: blackListForm.value.reason.trim(),
    dateAdded: blackListForm.value.dateAdded || formatIsoDate(new Date()),
    addedBy: blackListForm.value.addedBy.trim(),
    active: blackListForm.value.active,
  };

  if (blackListDialog.value.isEdit) {
    const entry = blackList.value.find((row) => row.id === blackListDialog.value.entryId);
    if (!entry) {
      $q.notify({ type: 'negative', message: 'Запись черного списка не найдена.' });
      return;
    }
    Object.assign(entry, payload);
  } else {
    blackList.value.unshift({
      id: generateBlacklistId(),
      ...payload,
    });
  }

  blackListDialog.value.open = false;
  persistState();
  $q.notify({ type: 'positive', message: 'Запись черного списка сохранена.' });
}

function deleteBlacklistEntry(entry: BlacklistEntry): void {
  $q.dialog({
    title: 'Удаление записи',
    message: `Удалить запись по поставщику "${supplierName(entry.supplierId)}"?`,
    persistent: true,
    ok: { label: 'Удалить', color: 'negative' },
    cancel: { label: 'Отмена', flat: true },
  }).onOk(() => {
    blackList.value = blackList.value.filter((row) => row.id !== entry.id);
    persistState();
    $q.notify({ type: 'positive', message: 'Запись удалена.' });
  });
}

function openCreateLimitDialog(): void {
  limitDialog.value = { open: true, isEdit: false, limitId: null };
  limitForm.value = emptyLimitForm();
}

function openEditLimitDialog(limit: ApprovalLimit): void {
  limitDialog.value = { open: true, isEdit: true, limitId: limit.id };
  limitForm.value = {
    department: limit.department,
    amount: limit.amount,
    currency: limit.currency,
    approver: limit.approver,
    active: limit.active,
    comment: limit.comment,
  };
}

function saveLimitFromDialog(): void {
  if (!limitForm.value.department.trim() || !limitForm.value.approver.trim() || limitForm.value.amount <= 0) {
    $q.notify({ type: 'negative', message: 'Заполните подразделение, сумму лимита и согласующего.' });
    return;
  }

  const duplicate = approvalLimits.value.find(
    (row) =>
      row.department.toLowerCase() === limitForm.value.department.trim().toLowerCase() &&
      row.active &&
      row.id !== limitDialog.value.limitId,
  );
  if (duplicate) {
    $q.notify({ type: 'negative', message: 'Для этого подразделения уже существует активный лимит.' });
    return;
  }

  const payload = {
    department: limitForm.value.department.trim(),
    amount: Number(limitForm.value.amount),
    currency: 'RUB' as const,
    approver: limitForm.value.approver.trim(),
    active: limitForm.value.active,
    comment: limitForm.value.comment.trim(),
  };

  if (limitDialog.value.isEdit) {
    const limit = approvalLimits.value.find((row) => row.id === limitDialog.value.limitId);
    if (!limit) {
      $q.notify({ type: 'negative', message: 'Лимит не найден.' });
      return;
    }
    Object.assign(limit, payload);
  } else {
    approvalLimits.value.push({
      id: generateLimitId(),
      ...payload,
    });
  }

  limitDialog.value.open = false;
  persistState();
  $q.notify({ type: 'positive', message: 'Лимит согласования сохранен.' });
}

function deleteLimit(limit: ApprovalLimit): void {
  $q.dialog({
    title: 'Удаление лимита',
    message: `Удалить лимит для "${limit.department}"?`,
    persistent: true,
    ok: { label: 'Удалить', color: 'negative' },
    cancel: { label: 'Отмена', flat: true },
  }).onOk(() => {
    approvalLimits.value = approvalLimits.value.filter((row) => row.id !== limit.id);
    persistState();
    $q.notify({ type: 'positive', message: 'Лимит удален.' });
  });
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

function activeBlackListEntry(supplierId: number | null): BlacklistEntry | null {
  if (!supplierId) {
    return null;
  }
  return blackList.value.find((row) => row.supplierId === supplierId && row.active) ?? null;
}

function resolveApprovalLimit(request: ProcurementRequest): ApprovalLimit | null {
  const exact = approvalLimits.value.find(
    (row) =>
      row.active &&
      row.department.toLowerCase() === request.department.toLowerCase(),
  );
  if (exact) {
    return exact;
  }
  return (
    approvalLimits.value.find(
      (row) => row.active && row.department.toLowerCase() === 'общий лимит',
    ) ?? null
  );
}

function expectedRoleCode(status: RequestStatus): UserRole | null {
  if (status === 'draft' || status === 'need_fix' || status === 'rejected') {
    return 'requester';
  }
  if (status === 'submitted') {
    return 'system';
  }
  if (status === 'pending_approval') {
    return 'manager';
  }
  if (status === 'registered' || status === 'order_sent' || status === 'act_uploaded') {
    return 'supply';
  }
  if (status === 'invoice_received') {
    return 'accounting';
  }
  if (status === 'paid') {
    return 'system';
  }
  if (status === 'waiting_delivery' || status === 'warehouse_received' || status === 'closed') {
    return 'warehouse';
  }
  return null;
}

function expectedRoleLabel(request: ProcurementRequest): string {
  if (request.status === 'waiting_delivery' && isOverdue(request)) {
    return `${roleLabel('system')} / ${roleLabel('supply')}`;
  }
  const code = expectedRoleCode(request.status);
  return code ? roleLabel(code) : '—';
}

function daysInCurrentStatus(request: ProcurementRequest): number {
  const now = Date.now();
  const updated = new Date(request.updatedAt).getTime();
  if (Number.isNaN(updated)) {
    return 0;
  }
  const diff = now - updated;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function availableActions(request: ProcurementRequest): ActionButton[] {
  const actionsByStatus: Record<RequestStatus, ActionKey[]> = {
    draft: ['edit', 'submit', 'autoComplete'],
    submitted: ['runCheck', 'autoComplete'],
    need_fix: ['edit', 'submit', 'autoComplete'],
    pending_approval: ['approveRequest', 'rejectRequest', 'autoComplete'],
    rejected: ['edit', 'submit'],
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
    approveRequest: {
      key: 'approveRequest',
      label: 'Одобрить заявку',
      icon: 'how_to_reg',
      color: 'positive',
      roles: ['manager'],
    },
    rejectRequest: {
      key: 'rejectRequest',
      label: 'Отклонить заявку',
      icon: 'block',
      color: 'negative',
      roles: ['manager'],
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
      roles: ['requester', 'manager', 'supply', 'accounting', 'warehouse', 'system'],
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
    case 'pending_approval':
      return {
        title: 'Требуется решение руководителя',
        roleLabel: roleLabel('manager'),
        text: 'Сумма превышает лимит подразделения. Руководитель должен одобрить или отклонить заявку.',
      };
    case 'rejected':
      return {
        title: 'Заявка отклонена',
        roleLabel: roleRequester,
        text: 'Исправьте данные (например, поставщика) и повторно отправьте заявку в ИС.',
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
    case 'approveRequest':
      approveRequest(request);
      return;
    case 'rejectRequest':
      rejectRequest(request);
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
  if (!(request.status === 'draft' || request.status === 'need_fix' || request.status === 'rejected')) {
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

  const blackListEntry = activeBlackListEntry(request.supplierId);
  if (blackListEntry) {
    request.validationErrors = [`Поставщик в черном списке: ${blackListEntry.reason}`];
    logEvent(request, 'ИС', 'Автопроверка: поставщик заблокирован', blackListEntry.reason, 'rejected');
    persistState();
    if (!options?.silent) {
      $q.notify({ type: 'negative', message: 'Поставщик в черном списке. Заявка отклонена.' });
    }
    return;
  }

  const limit = resolveApprovalLimit(request);
  const total = requestTotal(request);
  if (limit && total > limit.amount) {
    request.validationErrors = [];
    logEvent(
      request,
      'ИС',
      'Автопроверка: требуется согласование',
      `Сумма ${formatMoney(total)} превышает лимит ${formatMoney(limit.amount)} (${limit.department})`,
      'pending_approval',
    );
    persistState();
    if (!options?.silent) {
      $q.notify({ type: 'warning', message: 'Сумма превышает лимит. Требуется решение руководителя.' });
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

function approveRequest(request: ProcurementRequest, options?: { silent?: boolean }): void {
  if (request.status !== 'pending_approval') {
    return;
  }
  if (!request.registrationNumber) {
    request.registrationNumber = generateRegistrationNumber();
  }
  request.validationErrors = [];
  logEvent(
    request,
    'Руководитель',
    'Заявка согласована',
    `Регистрационный номер: ${request.registrationNumber}`,
    'registered',
  );
  persistState();
  if (!options?.silent) {
    $q.notify({ type: 'positive', message: 'Руководитель согласовал заявку.' });
  }
}

function rejectRequest(request: ProcurementRequest, options?: { silent?: boolean }): void {
  if (request.status !== 'pending_approval') {
    return;
  }
  request.validationErrors = ['Требуется пересмотр заявки после отклонения руководителем.'];
  logEvent(request, 'Руководитель', 'Заявка отклонена', 'Необходимо скорректировать параметры заявки.', 'rejected');
  persistState();
  if (!options?.silent) {
    $q.notify({ type: 'negative', message: 'Заявка отклонена руководителем.' });
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
    if (request.status === 'draft' || request.status === 'need_fix' || request.status === 'rejected') {
      ensureRequestValidForAutoflow(request);
      if (request.status === 'rejected') {
        request.supplierId = suppliers.value.find((row) => !activeBlackListEntry(row.id))?.id ?? request.supplierId;
      }
      logEvent(request, 'Подразделение-заказчик', 'Автоисправление заявки', 'Данные приведены к корректному формату');
      submitRequest(request, { silent: true });
      continue;
    }
    if (request.status === 'submitted') {
      runAutoCheck(request, { silent: true });
      continue;
    }
    if (request.status === 'pending_approval') {
      approveRequest(request, { silent: true });
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
  if ((request.status === 'need_fix' || request.status === 'rejected') && stepCode === 'check') {
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

function graphLaneStyle(index: number): Record<string, string> {
  const even = index % 2 === 0;
  return {
    width: '2940px',
    height: '112px',
    border: '1px solid rgba(15, 89, 100, 0.18)',
    borderRadius: '10px',
    boxShadow: 'none',
    background: even
      ? 'linear-gradient(160deg, rgba(248, 253, 253, 0.88), rgba(238, 248, 248, 0.88))'
      : 'linear-gradient(160deg, rgba(255, 252, 247, 0.88), rgba(251, 245, 236, 0.88))',
    color: '#23414a',
    fontWeight: '700',
    fontSize: '13px',
    textAlign: 'left',
    padding: '7px 12px',
    pointerEvents: 'none',
  };
}

function requestStatusProgress(status: RequestStatus): number {
  const order: Record<RequestStatus, number> = {
    draft: 0,
    submitted: 1,
    need_fix: 1,
    pending_approval: 2,
    rejected: 1,
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
    if (request.status === 'need_fix' || request.status === 'rejected') {
      return 'error';
    }
    if (request.status === 'submitted' || request.status === 'pending_approval') {
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
  height: 700px;
  border: 1px solid rgba(15, 89, 100, 0.2);
  border-radius: 12px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(239, 248, 247, 0.8), rgba(253, 250, 242, 0.85));
}

:deep(.vue-flow__node-default) {
  white-space: normal;
  line-height: 1.3;
  text-align: left;
}

:deep(.vue-flow__node.bpmn-lane) {
  pointer-events: none;
  line-height: 1.2;
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
