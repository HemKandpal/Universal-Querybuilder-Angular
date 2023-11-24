import { FormBuilder, FormControl } from '@angular/forms';
import { Component } from '@angular/core';
import { QueryBuilderClassNames, QueryBuilderConfig } from 'angular2-query-builder';
import { ImmutableTree, Utils, CoreConfig } from "../core/modules";

@Component({
  selector: 'app-root',
  template: `
  <h2>Universal Query Builder</h2>
  <br>
  <query-builder [formControl]='queryCtrl' [config]='currentConfig' [allowRuleset]='allowRuleset' [allowCollapse]='allowCollapse' [persistValueOnFieldChange]='persistValueOnFieldChange'>
    <ng-container *queryInput="let rule; type: 'textarea'; let getDisabledState=getDisabledState">
      <textarea class="text-input text-area" [(ngModel)]="rule.value" [disabled]=getDisabledState()
        placeholder="Custom Textarea"></textarea>
    </ng-container>
    <ng-container *queryInput="let rule; type: 'number'">
    <ng-container *ngIf="rule.operator === 'InBetween'">
        <input [(ngModel)]="rule.value[0]" type="number" /> to 
        <input [(ngModel)]="rule.value[1]" type="number" />
    </ng-container>
    <ng-container *ngIf="rule.operator !== 'InBetween'">
        <input [(ngModel)]="rule.value" type="number" />
    </ng-container>
</ng-container>
  </query-builder>
  <br>
  <div>
    <div class="row">
      <!-- <p class="col-6">Control Valid (Vanilla): {{ queryCtrl.valid }}</p> -->
      <div class="col-6">
        <!-- <label><input type="checkbox" (change)=switchModes($event)>Entity Mode</label> -->
      </div>
    </div>
    <div class="row">
      <!-- <p class="col-6">Control Touched (Vanilla): {{ queryCtrl.touched }}</p> -->
      <div class="col-6">
        <!-- <label><input type="checkbox" (change)=changeDisabled($event)>Disabled</label> -->
      </div>
    </div>
    <div class="row">
      <div class="col-6">
        <!-- <label><input type="checkbox" [(ngModel)]='allowRuleset'>Allow Ruleset</label> -->
      </div>
      <div class="col-6">
        <!-- <label><input type="checkbox" [(ngModel)]='allowCollapse'>Allow Collapse</label> -->
      </div>
      <div class="col-6">
        <!-- <label><input type="checkbox" [(ngModel)]='persistValueOnFieldChange'>Persist Values on Field Change</label> -->
      </div>
    </div>
    <textarea class="output">{{query | json}}</textarea>
    <br/>
    <h4>DSL Query</h4>
    <button cButton color="primary" (click)=populateJsonlogic()>Get DSL</button>
    <textarea class="output">{{varJsonLogic | json}}</textarea>
    <textarea class="output">{{dsl | json}}</textarea>
  </div>
  
  `,
  styles: [`
  /deep/ html {
    font: 14px sans-serif;
    margin: 30px;
  }

  .mat-icon-button {
    outline: none;
  }

  .mat-arrow-icon {
    outline: none;
    line-height: 32px;
  }

  .mat-form-field {
    padding-left: 5px;
    padding-right: 5px;
  }

  .text-input {
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }

  .text-area {
    width: 300px;
    height: 100px;
  }

  .output {
    width: 100%;
    height: 300px;
  }
  `]
})
export class AppComponent {
  public queryCtrl: FormControl;

  public bootstrapClassNames: QueryBuilderClassNames = {
    removeIcon: 'fa fa-minus',
    addIcon: 'fa fa-plus',
    arrowIcon: 'fa fa-chevron-right px-2',
    button: 'btn',
    buttonGroup: 'btn-group',
    rightAlign: 'order-12 ml-auto',
    switchRow: 'd-flex px-2',
    switchGroup: 'd-flex align-items-center',
    switchRadio: 'custom-control-input',
    switchLabel: 'custom-control-label',
    switchControl: 'custom-control custom-radio custom-control-inline',
    row: 'row p-2 m-1',
    rule: 'border',
    ruleSet: 'border',
    invalidRuleSet: 'alert alert-danger',
    emptyWarning: 'text-danger mx-auto',
    operatorControl: 'form-control',
    operatorControlSize: 'col-auto pr-0',
    fieldControl: 'form-control',
    fieldControlSize: 'col-auto pr-0',
    entityControl: 'form-control',
    entityControlSize: 'col-auto pr-0',
    inputControl: 'form-control',
    inputControlSize: 'col-auto'
  };

  query = {
    condition: "and",
    rules: [
      { field: "foo", operator: "between", value: [] }
    ]
  };

  public varJsonLogic: any = {};
  public dsl: any = {};


  public entityConfig: QueryBuilderConfig = {
    entities: {
      physical: { name: 'Physical Attributes' },
      nonphysical: { name: 'Nonphysical Attributes' }
    },
    fields: {
      fileIndex: {
        name: 'FileIndex', type: "object",
        operators: ["between", "less", "bigger"],
        defaultValue: [1, 2]
      },
      index: { name: 'Index', type: 'string', entity: 'nonphysical' },
      episode: { name: 'Episode', type: 'string', entity: 'nonphysical' },
      sessionId: { name: 'SessionId', type: 'string', entity: 'nonphysical' },
      subSource: { name: 'SubSource', type: 'string', entity: 'nonphysical' },
      source: { name: 'Source', type: 'string', entity: 'nonphysical' },
      type: { name: 'Type', type: 'string', entity: 'nonphysical' },
      sreamName: { name: 'SreamName', type: 'string', entity: 'nonphysical' },
      _instance: { name: '_instance', type: 'string', entity: 'nonphysical' },
      threadId: { name: 'threadId', type: 'string', entity: 'nonphysical' },
      core: { name: 'core', type: 'string', entity: 'nonphysical' },
      name: { name: 'name', type: 'string', entity: 'nonphysical' },
      globalTimeStamp: { name: 'globalTimeStamp', type: 'string', entity: 'nonphysical' },
      id: { name: 'id', type: 'string', entity: 'nonphysical' },
      parameters: { name: 'parameters', type: 'string', entity: 'nonphysical' },
      timestamp: { name: 'timestamp', type: 'string', entity: 'nonphysical' },
    }
  };

  public config: QueryBuilderConfig = {
    fields: {
      fileIndex: {
        name: 'FileIndex', type: "object",
        operators: ["between", "less", "bigger"],
        defaultValue: [1, 2]
      },
      index: { defaultValue: [1, 2], name: 'Index', type: 'number', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<=", "InBetween"] },
      episode: { name: 'Episode', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<=", "Contains"] },
      sessionId: { name: 'SessionId', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
      subSource: { name: 'SubSource', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
      source: { name: 'Source', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
      type: { name: 'Type', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
      sreamName: { name: 'SreamName', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
      _instance: { name: '_instance', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
      threadId: { name: 'threadId', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
      core: { name: 'core', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
      name: { name: 'name', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
      globalTimeStamp: { name: 'globalTimeStamp', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
      id: { name: 'id', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
      parameters: { name: 'parameters', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
      timestamp: { name: 'timestamp', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
      foo: {
        name: "Foo",
        type: "number",
        operators: ['between', 'less', 'bigger'],
        defaultValue: [],
      }
    }
  };

  public currentConfig: QueryBuilderConfig;
  public allowRuleset: boolean = true;
  public allowCollapse!: boolean;
  public persistValueOnFieldChange: boolean = false;

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.queryCtrl = this.formBuilder.control(this.query);
    this.currentConfig = this.config;
  }

  switchModes(event: Event) {
    this.currentConfig = (<HTMLInputElement>event.target).checked ? this.entityConfig : this.config;
  }

  changeDisabled(event: Event) {
    (<HTMLInputElement>event.target).checked ? this.queryCtrl.disable() : this.queryCtrl.enable();
  }
  createJsonLogic(query: any, jsonLogic: any): any {
    if (query["condition"]) {
      let emptyRules: any = [];
      jsonLogic[query["condition"]] = emptyRules;
      this.addRulesSet(query["rules"], emptyRules);
    }
    if (query["operator"]) {
      let operator: any = query["operator"];
      if (query["field"] && query["value"]) {
        operator = (operator == "Contains") ? "#in" : operator;
        jsonLogic[operator] = [{ var: query["field"] }, query["value"]];
      }
    }
    return jsonLogic;
  }
  addRulesSet(rules: any, jsonLogic: any) {
    if (rules && rules.length > 0) {
      for (let index = 0; index < rules.length; index++) {
        let emptyRule: any = {};
        jsonLogic.push(emptyRule);
        this.createJsonLogic(rules[index], emptyRule);
      }
    }
  }
  populateJsonlogic() {
    this.createJsonLogic(this.query, this.varJsonLogic);
    console.log(this.varJsonLogic);
    console.log(JSON.stringify(this.varJsonLogic));
    this.dsl = this.getDsl(this.varJsonLogic);
  }
  getDsl(query: any) {
    const {
      uuid,
      checkTree, loadTree, _loadFromJsonLogic, loadFromSpel, isJsonLogic, elasticSearchFormat, loadFromJsonLogic,
      queryString, sqlFormat, _sqlFormat, spelFormat, mongodbFormat, jsonLogicFormat, queryBuilderFormat, getTree, ConfigUtils
    } = Utils;
    let tree: ImmutableTree | undefined = loadFromJsonLogic(query, {
      conjunctions: {
        "AND": {
          "label": "And",
          "mongoConj": "$and",
          "jsonLogicConj": "and",
          "sqlConj": "AND",
          "spelConj": "and",
          "spelConjs": [
            "and",
            "&&"
          ],
          "reversedConj": "OR",
          formatConj: "", sqlFormatConj: "", spelFormatConj: ""
        },
        "OR": {
          "label": "Or",
          "mongoConj": "$or",
          "jsonLogicConj": "or",
          "sqlConj": "OR",
          "spelConj": "or",
          "spelConjs": [
            "or",
            "||"
          ],
          "reversedConj": "AND",
          formatConj: "", sqlFormatConj: "", spelFormatConj: ""
        }
      },
      operators: CoreConfig.operators,
      widgets: CoreConfig.widgets,
      types: {
        "text": {
          "defaultOperator": "equal",
          "mainWidget": "text",
          "widgets": {
            "text": {
              "widgetProps": {},
              "operators": [
                "equal",
                "not_equal",
                "like",
                "not_like",
                "starts_with",
                "ends_with",
                "proximity",
                "is_empty",
                "is_not_empty",
                "is_null",
                "is_not_null",
              ],
              "opProps": {}
            },
            "textarea": {
              "operators": [
                "equal",
                "not_equal",
                "like",
                "not_like",
                "starts_with",
                "ends_with",
                "is_empty",
                "is_not_empty",
                "is_null",
                "is_not_null"
              ],
              "widgetProps": {},
              "opProps": {}
            },
            "field": {
              "operators": [
                "equal",
                "not_equal",
                "proximity"
              ]
            },
            "func": {}
          },
          "excludeOperators": [
            "proximity"
          ],
          "valueSources": [
            "value",
            "field",
            "func"
          ],
        },
        "number": {
          "defaultOperator": "equal",
          "mainWidget": "number",
          "widgets": {
            "number": {
              "widgetProps": {},
              "operators": [
                "equal",
                "not_equal",
                "less",
                "less_or_equal",
                "greater",
                "greater_or_equal",
                "between",
                "not_between",
                "is_null",
                "is_not_null"
              ]
            },
            "slider": {
              "operators": [
                "equal",
                "not_equal",
                "less",
                "less_or_equal",
                "greater",
                "greater_or_equal",
                "is_null",
                "is_not_null"
              ]
            },
            "rangeslider": {
              "operators": [
                "between",
                "not_between",
                "is_null",
                "is_not_null"
              ]
            },
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
        },
        "date": {
          "defaultOperator": "equal",
          "widgets": {
            "date": {
              "widgetProps": {},
              "operators": [
                "equal",
                "not_equal",
                "less",
                "less_or_equal",
                "greater",
                "greater_or_equal",
                "between",
                "not_between",
                "is_null",
                "is_not_null"
              ]
            },
            "field": {},
            "func": {}
          },
          "mainWidget": "date",
          "valueSources": [
            "value",
            "field",
            "func"
          ],

        },
        "time": {
          "defaultOperator": "equal",
          "widgets": {
            "time": {
              "widgetProps": {},
              "operators": [
                "equal",
                "not_equal",
                "less",
                "less_or_equal",
                "greater",
                "greater_or_equal",
                "between",
                "not_between",
                "is_null",
                "is_not_null"
              ]
            },
            "field": {},
            "func": {}
          },
          "mainWidget": "time",
          "valueSources": [
            "value",
            "field",
            "func"
          ],
        },
        "datetime": {
          "defaultOperator": "equal",
          "widgets": {
            "datetime": {
              "widgetProps": {},
              "operators": [
                "equal",
                "not_equal",
                "less",
                "less_or_equal",
                "greater",
                "greater_or_equal",
                "between",
                "not_between",
                "is_null",
                "is_not_null"
              ]
            },
            "field": {},
            "func": {}
          },
          "mainWidget": "datetime",
          "valueSources": [
            "value",
            "field",
            "func"
          ],
        },
        "select": {
          "mainWidget": "select",
          "defaultOperator": "select_equals",
          "widgets": {
            "select": {
              "widgetProps": {
                "customProps": {
                  "showSearch": true
                }
              },
              "operators": [
                "select_equals",
                "select_not_equals",
                "is_null",
                "is_not_null"
              ]
            },
            "multiselect": {
              "operators": [
                "select_any_in",
                "select_not_any_in",
                "is_null",
                "is_not_null"
              ]
            },
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
        },
        "multiselect": {
          "defaultOperator": "multiselect_equals",
          "widgets": {
            "multiselect": {
              "widgetProps": {},
              "operators": [
                "multiselect_contains",
                "multiselect_not_contains",
                "multiselect_equals",
                "multiselect_not_equals",
                "is_null",
                "is_not_null"
              ]
            },
            "field": {},
            "func": {}
          },
          "mainWidget": "multiselect",
          "valueSources": [
            "value",
            "field",
            "func"
          ],

        },
        "boolean": {
          "defaultOperator": "equal",
          "widgets": {
            "boolean": {
              "widgetProps": {
                "hideOperator": true,
                "operatorInlineLabel": "is"
              },
              "operators": [
                "equal",
                "not_equal",
                "is_null",
                "is_not_null"
              ],

            },
            "field": {
              "operators": [
                "equal",
                "not_equal"
              ]
            },
            "func": {}
          },
          "mainWidget": "boolean",
          "valueSources": [
            "value",
            "field",
            "func"
          ],

        },
        "!group": {
          "defaultOperator": "some",
          "mainWidget": "number",
          "widgets": {
            "number": {
              "widgetProps": {
                "min": 0
              },
              "operators": [
                "some",
                "all",
                "none",
                "equal",
                "not_equal",
                "less",
                "less_or_equal",
                "greater",
                "greater_or_equal",
                "between",
                "not_between"
              ],
              "opProps": {
              }
            },
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
        },
        "case_value": {
          "mainWidget": "case_value",
          "widgets": {
            "case_value": {
              "widgetProps": {}
            },
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ]
        }
      },
      settings: {
        jsonLogic: {
          "groupVarKey": "var",
          "altVarKey": "var",
          "lockedOp": "locked"
        },
        "fieldSources": [
          "field",
          "func"
        ],
        "keepInputOnChangeFieldSrc": true,
        "fieldItemKeysForSearch": [
          "label",
          "path",
          "altLabel",
          "grouplabel"
        ],
        "listKeysForSearch": [
          "title",
          "value"
        ],
        "valueSourcesInfo": {
          "value": {
            "label": "Value"
          },
          "field": {
            "label": "Field",
            "widget": "field"
          },
          "func": {
            "label": "Function",
            "widget": "func"
          }
        },
        "fieldSeparator": ".",
        "fieldSeparatorDisplay": ".",
        "canReorder": true,
        "canRegroup": true,
        "canDeleteLocked": false,
        "canLeaveEmptyGroup": true,
        "shouldCreateEmptyGroup": false,
        "canShortMongoQuery": true,
        "removeEmptyGroupsOnLoad": true,
        "removeIncompleteRulesOnLoad": true,
        "removeInvalidMultiSelectValuesOnLoad": true,
        "setOpOnChangeField": [
          "keep",
          "default"
        ],
        "groupOperators": [
          "some",
          "all",
          "none"
        ],
        "locale": {
          "moment": "ru",
          "antd": {
            "locale": "ru",
            "Pagination": {
              "items_per_page": "/ стр.",
              "jump_to": "Перейти",
              "jump_to_confirm": "подтвердить",
              "page": "Страница",
              "prev_page": "Назад",
              "next_page": "Вперед",
              "prev_5": "Предыдущие 5",
              "next_5": "Следующие 5",
              "prev_3": "Предыдущие 3",
              "next_3": "Следующие 3",
              "page_size": "размер страницы"
            },
            "DatePicker": {
              "lang": {
                "placeholder": "Выберите дату",
                "yearPlaceholder": "Выберите год",
                "quarterPlaceholder": "Выберите квартал",
                "monthPlaceholder": "Выберите месяц",
                "weekPlaceholder": "Выберите неделю",
                "rangePlaceholder": [
                  "Начальная дата",
                  "Конечная дата"
                ],
                "rangeYearPlaceholder": [
                  "Начальный год",
                  "Год окончания"
                ],
                "rangeMonthPlaceholder": [
                  "Начальный месяц",
                  "Конечный месяц"
                ],
                "rangeWeekPlaceholder": [
                  "Начальная неделя",
                  "Конечная неделя"
                ],
                "locale": "ru_RU",
                "today": "Сегодня",
                "now": "Сейчас",
                "backToToday": "Текущая дата",
                "ok": "ОК",
                "clear": "Очистить",
                "month": "Месяц",
                "year": "Год",
                "timeSelect": "Выбрать время",
                "dateSelect": "Выбрать дату",
                "monthSelect": "Выбрать месяц",
                "yearSelect": "Выбрать год",
                "decadeSelect": "Выбрать десятилетие",
                "yearFormat": "YYYY",
                "dateFormat": "D-M-YYYY",
                "dayFormat": "D",
                "dateTimeFormat": "D-M-YYYY HH:mm:ss",
                "monthBeforeYear": true,
                "previousMonth": "Предыдущий месяц (PageUp)",
                "nextMonth": "Следующий месяц (PageDown)",
                "previousYear": "Предыдущий год (Control + left)",
                "nextYear": "Следующий год (Control + right)",
                "previousDecade": "Предыдущее десятилетие",
                "nextDecade": "Следущее десятилетие",
                "previousCentury": "Предыдущий век",
                "nextCentury": "Следующий век"
              },
              "timePickerLocale": {
                "placeholder": "Выберите время",
                "rangePlaceholder": [
                  "Время начала",
                  "Время окончания"
                ]
              }
            },
            "TimePicker": {
              "placeholder": "Выберите время",
              "rangePlaceholder": [
                "Время начала",
                "Время окончания"
              ]
            },
            "Calendar": {
              "lang": {
                "placeholder": "Выберите дату",
                "yearPlaceholder": "Выберите год",
                "quarterPlaceholder": "Выберите квартал",
                "monthPlaceholder": "Выберите месяц",
                "weekPlaceholder": "Выберите неделю",
                "rangePlaceholder": [
                  "Начальная дата",
                  "Конечная дата"
                ],
                "rangeYearPlaceholder": [
                  "Начальный год",
                  "Год окончания"
                ],
                "rangeMonthPlaceholder": [
                  "Начальный месяц",
                  "Конечный месяц"
                ],
                "rangeWeekPlaceholder": [
                  "Начальная неделя",
                  "Конечная неделя"
                ],
                "locale": "ru_RU",
                "today": "Сегодня",
                "now": "Сейчас",
                "backToToday": "Текущая дата",
                "ok": "ОК",
                "clear": "Очистить",
                "month": "Месяц",
                "year": "Год",
                "timeSelect": "Выбрать время",
                "dateSelect": "Выбрать дату",
                "monthSelect": "Выбрать месяц",
                "yearSelect": "Выбрать год",
                "decadeSelect": "Выбрать десятилетие",
                "yearFormat": "YYYY",
                "dateFormat": "D-M-YYYY",
                "dayFormat": "D",
                "dateTimeFormat": "D-M-YYYY HH:mm:ss",
                "monthBeforeYear": true,
                "previousMonth": "Предыдущий месяц (PageUp)",
                "nextMonth": "Следующий месяц (PageDown)",
                "previousYear": "Предыдущий год (Control + left)",
                "nextYear": "Следующий год (Control + right)",
                "previousDecade": "Предыдущее десятилетие",
                "nextDecade": "Следущее десятилетие",
                "previousCentury": "Предыдущий век",
                "nextCentury": "Следующий век"
              },
              "timePickerLocale": {
                "placeholder": "Выберите время",
                "rangePlaceholder": [
                  "Время начала",
                  "Время окончания"
                ]
              }
            },
            "global": {
              "placeholder": "Пожалуйста выберите"
            },
            "Table": {
              "filterTitle": "Фильтр",
              "filterConfirm": "OK",
              "filterReset": "Сбросить",
              "filterEmptyText": "Без фильтров",
              "filterCheckall": "Выбрать все элементы",
              "filterSearchPlaceholder": "Поиск в фильтрах",
              "emptyText": "Нет данных",
              "selectAll": "Выбрать всё",
              "selectInvert": "Инвертировать выбор",
              "selectNone": "Очистить все данные",
              "selectionAll": "Выбрать все данные",
              "sortTitle": "Сортировка",
              "expand": "Развернуть строку",
              "collapse": "Свернуть строку",
              "triggerDesc": "Нажмите для сортировки по убыванию",
              "triggerAsc": "Нажмите для сортировки по возрастанию",
              "cancelSort": "Нажмите, чтобы отменить сортировку"
            },
            "Tour": {
              "Next": "Далее",
              "Previous": "Назад",
              "Finish": "Завершить"
            },
            "Modal": {
              "okText": "OK",
              "cancelText": "Отмена",
              "justOkText": "OK"
            },
            "Popconfirm": {
              "okText": "OK",
              "cancelText": "Отмена"
            },
            "Transfer": {
              "titles": [
                "",
                ""
              ],
              "searchPlaceholder": "Поиск",
              "itemUnit": "элем.",
              "itemsUnit": "элем.",
              "remove": "Удалить",
              "selectAll": "Выбрать все данные",
              "selectCurrent": "Выбрать текущую страницу",
              "selectInvert": "Инвертировать выбор",
              "removeAll": "Удалить все данные",
              "removeCurrent": "Удалить текущую страницу"
            },
            "Upload": {
              "uploading": "Загрузка...",
              "removeFile": "Удалить файл",
              "uploadError": "При загрузке произошла ошибка",
              "previewFile": "Предпросмотр файла",
              "downloadFile": "Загрузить файл"
            },
            "Empty": {
              "description": "Нет данных"
            },
            "Icon": {
              "icon": "иконка"
            },
            "Text": {
              "edit": "Редактировать",
              "copy": "Копировать",
              "copied": "Скопировано",
              "expand": "Раскрыть"
            },
            "PageHeader": {
              "back": "Назад"
            },
            "Form": {
              "optional": "(необязательно)",
              "defaultValidateMessages": {
                "default": "Ошибка проверки поля ${label}",
                "required": "Пожалуйста, введите ${label}",
                "enum": "${label} должен быть одним из [${enum}]",
                "whitespace": "${label} не может быть пустым",
                "date": {
                  "format": "${label} не правильный формат даты",
                  "parse": "${label} не может быть преобразовано в дату",
                  "invalid": "${label} не является корректной датой"
                },
                "types": {
                  "string": "${label} не является типом ${type}",
                  "method": "${label} не является типом ${type}",
                  "array": "${label} не является типом ${type}",
                  "object": "${label} не является типом ${type}",
                  "number": "${label} не является типом ${type}",
                  "date": "${label} не является типом ${type}",
                  "boolean": "${label} не является типом ${type}",
                  "integer": "${label} не является типом ${type}",
                  "float": "${label} не является типом ${type}",
                  "regexp": "${label} не является типом ${type}",
                  "email": "${label} не является типом ${type}",
                  "url": "${label} не является типом ${type}",
                  "hex": "${label} не является типом ${type}"
                },
                "string": {
                  "len": "${label} должна быть ${len} символов",
                  "min": "${label} должна быть больше или равна ${min} символов",
                  "max": "${label} должна быть меньше или равна ${max} символов",
                  "range": "Длина ${label} должна быть между ${min}-${max} символами"
                },
                "number": {
                  "len": "${label} должна быть равна ${len}",
                  "min": "${label} должна быть больше или равна ${min}",
                  "max": "${label} должна быть меньше или равна ${max}",
                  "range": "${label} должна быть между ${min}-${max}"
                },
                "array": {
                  "len": "Количество элементов ${label} должно быть равно ${len}",
                  "min": "Количество элементов ${label} должно быть больше или равно ${min}",
                  "max": "Количество элементов ${label} должно быть меньше или равно ${max}",
                  "range": "Количество элементов ${label} должно быть между ${min} и ${max}"
                },
                "pattern": {
                  "mismatch": "${label} не соответствует шаблону ${pattern}"
                }
              }
            },
            "Image": {
              "preview": "Предпросмотр"
            },
            "QRCode": {
              "expired": "QR-код устарел",
              "refresh": "Обновить"
            }
          },
          "material": {
            "props": {
              "MuiTablePagination": {
                "backIconButtonText": "Предыдущая страница",
                "labelRowsPerPage": "Строк на странице:",
                "nextIconButtonText": "Следующая страница"
              },
              "MuiRating": {},
              "MuiAutocomplete": {
                "clearText": "Очистить",
                "closeText": "Закрыть",
                "loadingText": "Загрузка…",
                "noOptionsText": "Нет доступных вариантов",
                "openText": "Открыть"
              },
              "MuiAlert": {
                "closeText": "Закрыть"
              }
            }
          },
          "mui": {
            "components": {
              "MuiBreadcrumbs": {
                "defaultProps": {
                  "expandText": "Показать полный путь"
                }
              },
              "MuiTablePagination": {
                "defaultProps": {
                  "labelRowsPerPage": "Строк на странице:"
                }
              },
              "MuiRating": {
                "defaultProps": {
                  "emptyLabelText": "Рейтинг отсутствует"
                }
              },
              "MuiAutocomplete": {
                "defaultProps": {
                  "clearText": "Очистить",
                  "closeText": "Закрыть",
                  "loadingText": "Загрузка…",
                  "noOptionsText": "Нет доступных вариантов",
                  "openText": "Открыть"
                }
              },
              "MuiAlert": {
                "defaultProps": {
                  "closeText": "Закрыть"
                }
              },
              "MuiPagination": {
                "defaultProps": {
                  "aria-label": "Навигация по страницам"
                }
              }
            }
          }
        },
        "valueLabel": "Value",
        "valuePlaceholder": "Value",
        "fieldLabel": "Field",
        "operatorLabel": "Operator",
        "funcLabel": "Function",
        "fieldPlaceholder": "Select field",
        "funcPlaceholder": "Select function",
        "operatorPlaceholder": "Select operator",
        "lockLabel": "Lock",
        "lockedLabel": "Locked",
        "deleteLabel": "Delete",
        "addGroupLabel": "Add group",
        "addCaseLabel": "Add condition",
        "addDefaultCaseLabel": "Add default condition",
        "defaultCaseLabel": "Default:",
        "addRuleLabel": "Add rule",
        "addSubRuleLabel": "Add sub rule",
        "delGroupLabel": "Delete",
        "notLabel": "Not",
        "fieldSourcesPopupTitle": "Select source",
        "valueSourcesPopupTitle": "Select value source",
        "removeRuleConfirmOptions": {
          "title": "Are you sure delete this rule?",
          "okText": "Yes",
          "okType": "danger",
          "cancelText": "Cancel"
        },
        "removeGroupConfirmOptions": {
          "title": "Are you sure delete this group?",
          "okText": "Yes",
          "okType": "danger",
          "cancelText": "Cancel"
        },
        "convertableWidgets": {
          "number": [
            "slider",
            "rangeslider"
          ],
          "slider": [
            "number",
            "rangeslider"
          ],
          "rangeslider": [
            "number",
            "slider"
          ],
          "text": [
            "textarea"
          ],
          "textarea": [
            "text"
          ]
        },
        "showLock": false,
        "showNot": true,
        "forceShowConj": false,
        "maxNesting": 5,
        "showErrorMessage": true
      },
      fields: {
        "user": {
          "label": "User",
          "tooltip": "Group of fields",
          "type": "!struct",
          "subfields": {
            "firstName": {
              "label2": "Username",
              "type": "text",
              "fieldSettings": {},
              "mainWidgetProps": {
                "valueLabel": "Name",
                "valuePlaceholder": "Enter name"
              },
              "widgets": {
                "text": {
                  "widgetProps": {
                    "valueLabel": "Name",
                    "valuePlaceholder": "Enter name"
                  }
                },
                "textarea": {},
                "field": {},
                "func": {}
              },
              "valueSources": [
                "value",
                "field",
                "func"
              ],
              "operators": [
                "equal",
                "not_equal",
                "like",
                "not_like",
                "starts_with",
                "ends_with",
                "is_empty",
                "is_not_empty",
                "is_null",
                "is_not_null"
              ]
            },
            "login": {
              "type": "text",
              "tableName": "t1",
              "fieldSettings": {},
              "mainWidgetProps": {
                "valueLabel": "Login",
                "valuePlaceholder": "Enter login"
              },
              "widgets": {
                "text": {
                  "widgetProps": {
                    "valueLabel": "Login",
                    "valuePlaceholder": "Enter login"
                  }
                },
                "textarea": {},
                "field": {},
                "func": {}
              },
              "valueSources": [
                "value",
                "field",
                "func"
              ],
              "operators": [
                "equal",
                "not_equal",
                "like",
                "not_like",
                "starts_with",
                "ends_with",
                "is_empty",
                "is_not_empty",
                "is_null",
                "is_not_null"
              ]
            }
          }
        },
        "dwords": {
          "subfields": [],

          "label": "Dwords",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "fileIndex": {
          "subfields": [],
          "label": "FileIndex",
          "type": "number",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "greater",
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "index": {
          "subfields": [],
          "label": "Index",
          "type": "number",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "episode": {
          "subfields": [],
          "label": "Episode",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "sessionId": {
          "subfields": [],

          "label": "SessionId",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "subSource": {
          "subfields": [],

          "label": "subSource",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "source": {
          "subfields": [],

          "label": "Source",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "type": {
          "subfields": [],

          "label": "Type",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "sreamName": {
          "subfields": [],

          "label": "StreamName",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "_instance": {
          "subfields": [],

          "label": "Instance",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "threadId": {
          "subfields": [],

          "label": "ThreadId",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "core": {
          "subfields": [],

          "label": "Core",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "_update": {
          "subfields": [],

          "label": "Update",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "name": {
          "subfields": [],

          "label": "Name",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "globalTimeStamp": {
          "subfields": [],

          "label": "GlobalTimeStamp",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "id": {
          "subfields": [],

          "label": "Id",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "parameters": {
          "subfields": [],

          "label": "Parameters",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
        "timestamp": {
          "subfields": [],

          "label": "Id",
          "type": "text",
          "preferWidgets": [
            "textarea"
          ],
          "fieldSettings": {
            "maxLength": 1000
          },
          "widgets": {
            "text": {
              "widgetProps": {}
            },
            "textarea": {},
            "field": {},
            "func": {}
          },
          "valueSources": [
            "value",
            "field",
            "func"
          ],
          "operators": [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_empty",
            "is_not_empty",
            "is_null",
            "is_not_null"
          ]
        },
      },
      ctx: {
        "utils": {
          "SqlString": {}
        },
        "W": {},
        "O": {}
      }
    });
    if (tree != undefined) {
      return elasticSearchFormat(tree, {
        conjunctions: {
          "AND": {
            "label": "And",
            "mongoConj": "$and",
            "jsonLogicConj": "and",
            "sqlConj": "AND",
            "spelConj": "and",
            "spelConjs": [
              "and",
              "&&"
            ],
            "reversedConj": "OR",
            formatConj: "", sqlFormatConj: "", spelFormatConj: ""
          },
          "OR": {
            "label": "Or",
            "mongoConj": "$or",
            "jsonLogicConj": "or",
            "sqlConj": "OR",
            "spelConj": "or",
            "spelConjs": [
              "or",
              "||"
            ],
            "reversedConj": "AND",
            formatConj: "", sqlFormatConj: "", spelFormatConj: ""
          }
        },
        operators: CoreConfig.operators,
        widgets: CoreConfig.widgets,
        types: {
          "text": {
            "defaultOperator": "equal",
            "mainWidget": "text",
            "widgets": {
              "text": {
                "widgetProps": {},
                "operators": [
                  "equal",
                  "not_equal",
                  "like",
                  "not_like",
                  "starts_with",
                  "ends_with",
                  "proximity",
                  "is_empty",
                  "is_not_empty",
                  "is_null",
                  "is_not_null",
                ],
                "opProps": {}
              },
              "textarea": {
                "operators": [
                  "equal",
                  "not_equal",
                  "like",
                  "not_like",
                  "starts_with",
                  "ends_with",
                  "is_empty",
                  "is_not_empty",
                  "is_null",
                  "is_not_null"
                ],
                "widgetProps": {},
                "opProps": {}
              },
              "field": {
                "operators": [
                  "equal",
                  "not_equal",
                  "proximity"
                ]
              },
              "func": {}
            },
            "excludeOperators": [
              "proximity"
            ],
            "valueSources": [
              "value",
              "field",
              "func"
            ],
          },
          "number": {
            "defaultOperator": "equal",
            "mainWidget": "number",
            "widgets": {
              "number": {
                "widgetProps": {},
                "operators": [
                  "equal",
                  "not_equal",
                  "less",
                  "less_or_equal",
                  "greater",
                  "greater_or_equal",
                  "between",
                  "not_between",
                  "is_null",
                  "is_not_null"
                ]
              },
              "slider": {
                "operators": [
                  "equal",
                  "not_equal",
                  "less",
                  "less_or_equal",
                  "greater",
                  "greater_or_equal",
                  "is_null",
                  "is_not_null"
                ]
              },
              "rangeslider": {
                "operators": [
                  "between",
                  "not_between",
                  "is_null",
                  "is_not_null"
                ]
              },
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
          },
          "date": {
            "defaultOperator": "equal",
            "widgets": {
              "date": {
                "widgetProps": {},
                "operators": [
                  "equal",
                  "not_equal",
                  "less",
                  "less_or_equal",
                  "greater",
                  "greater_or_equal",
                  "between",
                  "not_between",
                  "is_null",
                  "is_not_null"
                ]
              },
              "field": {},
              "func": {}
            },
            "mainWidget": "date",
            "valueSources": [
              "value",
              "field",
              "func"
            ],

          },
          "time": {
            "defaultOperator": "equal",
            "widgets": {
              "time": {
                "widgetProps": {},
                "operators": [
                  "equal",
                  "not_equal",
                  "less",
                  "less_or_equal",
                  "greater",
                  "greater_or_equal",
                  "between",
                  "not_between",
                  "is_null",
                  "is_not_null"
                ]
              },
              "field": {},
              "func": {}
            },
            "mainWidget": "time",
            "valueSources": [
              "value",
              "field",
              "func"
            ],
          },
          "datetime": {
            "defaultOperator": "equal",
            "widgets": {
              "datetime": {
                "widgetProps": {},
                "operators": [
                  "equal",
                  "not_equal",
                  "less",
                  "less_or_equal",
                  "greater",
                  "greater_or_equal",
                  "between",
                  "not_between",
                  "is_null",
                  "is_not_null"
                ]
              },
              "field": {},
              "func": {}
            },
            "mainWidget": "datetime",
            "valueSources": [
              "value",
              "field",
              "func"
            ],
          },
          "select": {
            "mainWidget": "select",
            "defaultOperator": "select_equals",
            "widgets": {
              "select": {
                "widgetProps": {
                  "customProps": {
                    "showSearch": true
                  }
                },
                "operators": [
                  "select_equals",
                  "select_not_equals",
                  "is_null",
                  "is_not_null"
                ]
              },
              "multiselect": {
                "operators": [
                  "select_any_in",
                  "select_not_any_in",
                  "is_null",
                  "is_not_null"
                ]
              },
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
          },
          "multiselect": {
            "defaultOperator": "multiselect_equals",
            "widgets": {
              "multiselect": {
                "widgetProps": {},
                "operators": [
                  "multiselect_contains",
                  "multiselect_not_contains",
                  "multiselect_equals",
                  "multiselect_not_equals",
                  "is_null",
                  "is_not_null"
                ]
              },
              "field": {},
              "func": {}
            },
            "mainWidget": "multiselect",
            "valueSources": [
              "value",
              "field",
              "func"
            ],

          },
          "boolean": {
            "defaultOperator": "equal",
            "widgets": {
              "boolean": {
                "widgetProps": {
                  "hideOperator": true,
                  "operatorInlineLabel": "is"
                },
                "operators": [
                  "equal",
                  "not_equal",
                  "is_null",
                  "is_not_null"
                ],

              },
              "field": {
                "operators": [
                  "equal",
                  "not_equal"
                ]
              },
              "func": {}
            },
            "mainWidget": "boolean",
            "valueSources": [
              "value",
              "field",
              "func"
            ],

          },
          "!group": {
            "defaultOperator": "some",
            "mainWidget": "number",
            "widgets": {
              "number": {
                "widgetProps": {
                  "min": 0
                },
                "operators": [
                  "some",
                  "all",
                  "none",
                  "equal",
                  "not_equal",
                  "less",
                  "less_or_equal",
                  "greater",
                  "greater_or_equal",
                  "between",
                  "not_between"
                ],
                "opProps": {
                }
              },
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
          },
          "case_value": {
            "mainWidget": "case_value",
            "widgets": {
              "case_value": {
                "widgetProps": {}
              },
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ]
          }
        },
        settings: {
          jsonLogic: {
            "groupVarKey": "var",
            "altVarKey": "var",
            "lockedOp": "locked"
          },
          "fieldSources": [
            "field",
            "func"
          ],
          "keepInputOnChangeFieldSrc": true,
          "fieldItemKeysForSearch": [
            "label",
            "path",
            "altLabel",
            "grouplabel"
          ],
          "listKeysForSearch": [
            "title",
            "value"
          ],
          "valueSourcesInfo": {
            "value": {
              "label": "Value"
            },
            "field": {
              "label": "Field",
              "widget": "field"
            },
            "func": {
              "label": "Function",
              "widget": "func"
            }
          },
          "fieldSeparator": ".",
          "fieldSeparatorDisplay": ".",
          "canReorder": true,
          "canRegroup": true,
          "canDeleteLocked": false,
          "canLeaveEmptyGroup": true,
          "shouldCreateEmptyGroup": false,
          "canShortMongoQuery": true,
          "removeEmptyGroupsOnLoad": true,
          "removeIncompleteRulesOnLoad": true,
          "removeInvalidMultiSelectValuesOnLoad": true,
          "setOpOnChangeField": [
            "keep",
            "default"
          ],
          "groupOperators": [
            "some",
            "all",
            "none"
          ],
          "locale": {
            "moment": "ru",
            "antd": {
              "locale": "ru",
              "Pagination": {
                "items_per_page": "/ стр.",
                "jump_to": "Перейти",
                "jump_to_confirm": "подтвердить",
                "page": "Страница",
                "prev_page": "Назад",
                "next_page": "Вперед",
                "prev_5": "Предыдущие 5",
                "next_5": "Следующие 5",
                "prev_3": "Предыдущие 3",
                "next_3": "Следующие 3",
                "page_size": "размер страницы"
              },
              "DatePicker": {
                "lang": {
                  "placeholder": "Выберите дату",
                  "yearPlaceholder": "Выберите год",
                  "quarterPlaceholder": "Выберите квартал",
                  "monthPlaceholder": "Выберите месяц",
                  "weekPlaceholder": "Выберите неделю",
                  "rangePlaceholder": [
                    "Начальная дата",
                    "Конечная дата"
                  ],
                  "rangeYearPlaceholder": [
                    "Начальный год",
                    "Год окончания"
                  ],
                  "rangeMonthPlaceholder": [
                    "Начальный месяц",
                    "Конечный месяц"
                  ],
                  "rangeWeekPlaceholder": [
                    "Начальная неделя",
                    "Конечная неделя"
                  ],
                  "locale": "ru_RU",
                  "today": "Сегодня",
                  "now": "Сейчас",
                  "backToToday": "Текущая дата",
                  "ok": "ОК",
                  "clear": "Очистить",
                  "month": "Месяц",
                  "year": "Год",
                  "timeSelect": "Выбрать время",
                  "dateSelect": "Выбрать дату",
                  "monthSelect": "Выбрать месяц",
                  "yearSelect": "Выбрать год",
                  "decadeSelect": "Выбрать десятилетие",
                  "yearFormat": "YYYY",
                  "dateFormat": "D-M-YYYY",
                  "dayFormat": "D",
                  "dateTimeFormat": "D-M-YYYY HH:mm:ss",
                  "monthBeforeYear": true,
                  "previousMonth": "Предыдущий месяц (PageUp)",
                  "nextMonth": "Следующий месяц (PageDown)",
                  "previousYear": "Предыдущий год (Control + left)",
                  "nextYear": "Следующий год (Control + right)",
                  "previousDecade": "Предыдущее десятилетие",
                  "nextDecade": "Следущее десятилетие",
                  "previousCentury": "Предыдущий век",
                  "nextCentury": "Следующий век"
                },
                "timePickerLocale": {
                  "placeholder": "Выберите время",
                  "rangePlaceholder": [
                    "Время начала",
                    "Время окончания"
                  ]
                }
              },
              "TimePicker": {
                "placeholder": "Выберите время",
                "rangePlaceholder": [
                  "Время начала",
                  "Время окончания"
                ]
              },
              "Calendar": {
                "lang": {
                  "placeholder": "Выберите дату",
                  "yearPlaceholder": "Выберите год",
                  "quarterPlaceholder": "Выберите квартал",
                  "monthPlaceholder": "Выберите месяц",
                  "weekPlaceholder": "Выберите неделю",
                  "rangePlaceholder": [
                    "Начальная дата",
                    "Конечная дата"
                  ],
                  "rangeYearPlaceholder": [
                    "Начальный год",
                    "Год окончания"
                  ],
                  "rangeMonthPlaceholder": [
                    "Начальный месяц",
                    "Конечный месяц"
                  ],
                  "rangeWeekPlaceholder": [
                    "Начальная неделя",
                    "Конечная неделя"
                  ],
                  "locale": "ru_RU",
                  "today": "Сегодня",
                  "now": "Сейчас",
                  "backToToday": "Текущая дата",
                  "ok": "ОК",
                  "clear": "Очистить",
                  "month": "Месяц",
                  "year": "Год",
                  "timeSelect": "Выбрать время",
                  "dateSelect": "Выбрать дату",
                  "monthSelect": "Выбрать месяц",
                  "yearSelect": "Выбрать год",
                  "decadeSelect": "Выбрать десятилетие",
                  "yearFormat": "YYYY",
                  "dateFormat": "D-M-YYYY",
                  "dayFormat": "D",
                  "dateTimeFormat": "D-M-YYYY HH:mm:ss",
                  "monthBeforeYear": true,
                  "previousMonth": "Предыдущий месяц (PageUp)",
                  "nextMonth": "Следующий месяц (PageDown)",
                  "previousYear": "Предыдущий год (Control + left)",
                  "nextYear": "Следующий год (Control + right)",
                  "previousDecade": "Предыдущее десятилетие",
                  "nextDecade": "Следущее десятилетие",
                  "previousCentury": "Предыдущий век",
                  "nextCentury": "Следующий век"
                },
                "timePickerLocale": {
                  "placeholder": "Выберите время",
                  "rangePlaceholder": [
                    "Время начала",
                    "Время окончания"
                  ]
                }
              },
              "global": {
                "placeholder": "Пожалуйста выберите"
              },
              "Table": {
                "filterTitle": "Фильтр",
                "filterConfirm": "OK",
                "filterReset": "Сбросить",
                "filterEmptyText": "Без фильтров",
                "filterCheckall": "Выбрать все элементы",
                "filterSearchPlaceholder": "Поиск в фильтрах",
                "emptyText": "Нет данных",
                "selectAll": "Выбрать всё",
                "selectInvert": "Инвертировать выбор",
                "selectNone": "Очистить все данные",
                "selectionAll": "Выбрать все данные",
                "sortTitle": "Сортировка",
                "expand": "Развернуть строку",
                "collapse": "Свернуть строку",
                "triggerDesc": "Нажмите для сортировки по убыванию",
                "triggerAsc": "Нажмите для сортировки по возрастанию",
                "cancelSort": "Нажмите, чтобы отменить сортировку"
              },
              "Tour": {
                "Next": "Далее",
                "Previous": "Назад",
                "Finish": "Завершить"
              },
              "Modal": {
                "okText": "OK",
                "cancelText": "Отмена",
                "justOkText": "OK"
              },
              "Popconfirm": {
                "okText": "OK",
                "cancelText": "Отмена"
              },
              "Transfer": {
                "titles": [
                  "",
                  ""
                ],
                "searchPlaceholder": "Поиск",
                "itemUnit": "элем.",
                "itemsUnit": "элем.",
                "remove": "Удалить",
                "selectAll": "Выбрать все данные",
                "selectCurrent": "Выбрать текущую страницу",
                "selectInvert": "Инвертировать выбор",
                "removeAll": "Удалить все данные",
                "removeCurrent": "Удалить текущую страницу"
              },
              "Upload": {
                "uploading": "Загрузка...",
                "removeFile": "Удалить файл",
                "uploadError": "При загрузке произошла ошибка",
                "previewFile": "Предпросмотр файла",
                "downloadFile": "Загрузить файл"
              },
              "Empty": {
                "description": "Нет данных"
              },
              "Icon": {
                "icon": "иконка"
              },
              "Text": {
                "edit": "Редактировать",
                "copy": "Копировать",
                "copied": "Скопировано",
                "expand": "Раскрыть"
              },
              "PageHeader": {
                "back": "Назад"
              },
              "Form": {
                "optional": "(необязательно)",
                "defaultValidateMessages": {
                  "default": "Ошибка проверки поля ${label}",
                  "required": "Пожалуйста, введите ${label}",
                  "enum": "${label} должен быть одним из [${enum}]",
                  "whitespace": "${label} не может быть пустым",
                  "date": {
                    "format": "${label} не правильный формат даты",
                    "parse": "${label} не может быть преобразовано в дату",
                    "invalid": "${label} не является корректной датой"
                  },
                  "types": {
                    "string": "${label} не является типом ${type}",
                    "method": "${label} не является типом ${type}",
                    "array": "${label} не является типом ${type}",
                    "object": "${label} не является типом ${type}",
                    "number": "${label} не является типом ${type}",
                    "date": "${label} не является типом ${type}",
                    "boolean": "${label} не является типом ${type}",
                    "integer": "${label} не является типом ${type}",
                    "float": "${label} не является типом ${type}",
                    "regexp": "${label} не является типом ${type}",
                    "email": "${label} не является типом ${type}",
                    "url": "${label} не является типом ${type}",
                    "hex": "${label} не является типом ${type}"
                  },
                  "string": {
                    "len": "${label} должна быть ${len} символов",
                    "min": "${label} должна быть больше или равна ${min} символов",
                    "max": "${label} должна быть меньше или равна ${max} символов",
                    "range": "Длина ${label} должна быть между ${min}-${max} символами"
                  },
                  "number": {
                    "len": "${label} должна быть равна ${len}",
                    "min": "${label} должна быть больше или равна ${min}",
                    "max": "${label} должна быть меньше или равна ${max}",
                    "range": "${label} должна быть между ${min}-${max}"
                  },
                  "array": {
                    "len": "Количество элементов ${label} должно быть равно ${len}",
                    "min": "Количество элементов ${label} должно быть больше или равно ${min}",
                    "max": "Количество элементов ${label} должно быть меньше или равно ${max}",
                    "range": "Количество элементов ${label} должно быть между ${min} и ${max}"
                  },
                  "pattern": {
                    "mismatch": "${label} не соответствует шаблону ${pattern}"
                  }
                }
              },
              "Image": {
                "preview": "Предпросмотр"
              },
              "QRCode": {
                "expired": "QR-код устарел",
                "refresh": "Обновить"
              }
            },
            "material": {
              "props": {
                "MuiTablePagination": {
                  "backIconButtonText": "Предыдущая страница",
                  "labelRowsPerPage": "Строк на странице:",
                  "nextIconButtonText": "Следующая страница"
                },
                "MuiRating": {},
                "MuiAutocomplete": {
                  "clearText": "Очистить",
                  "closeText": "Закрыть",
                  "loadingText": "Загрузка…",
                  "noOptionsText": "Нет доступных вариантов",
                  "openText": "Открыть"
                },
                "MuiAlert": {
                  "closeText": "Закрыть"
                }
              }
            },
            "mui": {
              "components": {
                "MuiBreadcrumbs": {
                  "defaultProps": {
                    "expandText": "Показать полный путь"
                  }
                },
                "MuiTablePagination": {
                  "defaultProps": {
                    "labelRowsPerPage": "Строк на странице:"
                  }
                },
                "MuiRating": {
                  "defaultProps": {
                    "emptyLabelText": "Рейтинг отсутствует"
                  }
                },
                "MuiAutocomplete": {
                  "defaultProps": {
                    "clearText": "Очистить",
                    "closeText": "Закрыть",
                    "loadingText": "Загрузка…",
                    "noOptionsText": "Нет доступных вариантов",
                    "openText": "Открыть"
                  }
                },
                "MuiAlert": {
                  "defaultProps": {
                    "closeText": "Закрыть"
                  }
                },
                "MuiPagination": {
                  "defaultProps": {
                    "aria-label": "Навигация по страницам"
                  }
                }
              }
            }
          },
          "valueLabel": "Value",
          "valuePlaceholder": "Value",
          "fieldLabel": "Field",
          "operatorLabel": "Operator",
          "funcLabel": "Function",
          "fieldPlaceholder": "Select field",
          "funcPlaceholder": "Select function",
          "operatorPlaceholder": "Select operator",
          "lockLabel": "Lock",
          "lockedLabel": "Locked",
          "deleteLabel": "Delete",
          "addGroupLabel": "Add group",
          "addCaseLabel": "Add condition",
          "addDefaultCaseLabel": "Add default condition",
          "defaultCaseLabel": "Default:",
          "addRuleLabel": "Add rule",
          "addSubRuleLabel": "Add sub rule",
          "delGroupLabel": "Delete",
          "notLabel": "Not",
          "fieldSourcesPopupTitle": "Select source",
          "valueSourcesPopupTitle": "Select value source",
          "removeRuleConfirmOptions": {
            "title": "Are you sure delete this rule?",
            "okText": "Yes",
            "okType": "danger",
            "cancelText": "Cancel"
          },
          "removeGroupConfirmOptions": {
            "title": "Are you sure delete this group?",
            "okText": "Yes",
            "okType": "danger",
            "cancelText": "Cancel"
          },
          "convertableWidgets": {
            "number": [
              "slider",
              "rangeslider"
            ],
            "slider": [
              "number",
              "rangeslider"
            ],
            "rangeslider": [
              "number",
              "slider"
            ],
            "text": [
              "textarea"
            ],
            "textarea": [
              "text"
            ]
          },
          "showLock": false,
          "showNot": true,
          "forceShowConj": false,
          "maxNesting": 5,
          "showErrorMessage": true
        },
        fields: {
          "dwords": {
            "label": "Dwords",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ],
            "subfields": {}
          },
          "fileIndex": {
            "subfields": [],
            "label": "FileIndex",
            "type": "number",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "greater",
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "index": {
            "subfields": [],

            "label": "Index",
            "type": "number",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "episode": {
            "subfields": [],

            "label": "Episode",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "sessionId": {
            "subfields": [],

            "label": "SessionId",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "subSource": {
            "subfields": [],

            "label": "subSource",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "source": {
            "subfields": [],

            "label": "Source",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "type": {
            "subfields": [],

            "label": "Type",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "sreamName": {
            "subfields": [],

            "label": "StreamName",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "_instance": {
            "subfields": [],

            "label": "Instance",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "threadId": {
            "subfields": [],

            "label": "ThreadId",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "core": {
            "subfields": [],

            "label": "Core",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "_update": {
            "subfields": [],

            "label": "Update",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "name": {
            "subfields": [],

            "label": "Name",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "globalTimeStamp": {
            "subfields": [],

            "label": "GlobalTimeStamp",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "id": {
            "subfields": [],

            "label": "Id",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "parameters": {
            "subfields": [],

            "label": "Parameters",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          },
          "timestamp": {
            "subfields": [],

            "label": "Id",
            "type": "text",
            "preferWidgets": [
              "textarea"
            ],
            "fieldSettings": {
              "maxLength": 1000
            },
            "widgets": {
              "text": {
                "widgetProps": {}
              },
              "textarea": {},
              "field": {},
              "func": {}
            },
            "valueSources": [
              "value",
              "field",
              "func"
            ],
            "operators": [
              "equal",
              "not_equal",
              "like",
              "not_like",
              "starts_with",
              "ends_with",
              "is_empty",
              "is_not_empty",
              "is_null",
              "is_not_null"
            ]
          }
        },
        ctx: {
          "utils": {
            "SqlString": {}
          },
          "W": {},
          "O": {}
        }
      }, "ES_7_SYNTAX");
    }
    return null
  }
}
