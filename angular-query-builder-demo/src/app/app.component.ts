import { FormBuilder, FormControl } from '@angular/forms';
import { Component } from '@angular/core';
import { QueryBuilderClassNames, QueryBuilderConfig } from 'angular2-query-builder';
import { ImmutableTree, Utils, CoreConfig } from "../core/modules";
import * as fields from '../assets/fields.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ["./app.component.css"]
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
    rules: []
  };

  public varJsonLogic: any = {};
  public dsl: any = {};


  // public entityConfig: QueryBuilderConfig = {
  //   entities: {
  //     physical: { name: 'Physical Attributes' },
  //     nonphysical: { name: 'Nonphysical Attributes' }
  //   },
  //   fields: {
  //     fileIndex: {
  //       name: 'FileIndex', type: "object",
  //       operators: ["between", "less", "bigger"],
  //       defaultValue: [1, 2]
  //     },
  //     index: { name: 'Index', type: 'string', entity: 'nonphysical' },
  //     episode: { name: 'Episode', type: 'string', entity: 'nonphysical' },
  //     sessionId: { name: 'SessionId', type: 'string', entity: 'nonphysical' },
  //     subSource: { name: 'SubSource', type: 'string', entity: 'nonphysical' },
  //     source: { name: 'Source', type: 'string', entity: 'nonphysical' },
  //     type: { name: 'Type', type: 'string', entity: 'nonphysical' },
  //     sreamName: { name: 'SreamName', type: 'string', entity: 'nonphysical' },
  //     _instance: { name: '_instance', type: 'string', entity: 'nonphysical' },
  //     threadId: { name: 'threadId', type: 'string', entity: 'nonphysical' },
  //     core: { name: 'core', type: 'string', entity: 'nonphysical' },
  //     name: { name: 'name', type: 'string', entity: 'nonphysical' },
  //     globalTimeStamp: { name: 'globalTimeStamp', type: 'string', entity: 'nonphysical' },
  //     id: { name: 'id', type: 'string', entity: 'nonphysical' },
  //     parameters: { name: 'parameters', type: 'string', entity: 'nonphysical' },
  //     timestamp: { name: 'timestamp', type: 'string', entity: 'nonphysical' },
  //   }
  // };

  // public config: QueryBuilderConfig = {
  //   fields: {
  //     fileIndex: {
  //       name: 'FileIndex', type: "number",
  //       operators: ["==", "!=", ">", "<", "<=", "InBetween"],
  //       defaultValue: [1, 2]
  //     },
  //     index: { defaultValue: [1, 2], name: 'Index', type: 'number', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<=", "InBetween"] },
  //     episode: { name: 'Episode', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<=", "Contains"] },
  //     sessionId: { name: 'SessionId', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
  //     subSource: { name: 'SubSource', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
  //     source: { name: 'Source', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
  //     type: { name: 'Type', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
  //     sreamName: { name: 'SreamName', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
  //     _instance: { name: '_instance', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
  //     threadId: { name: 'threadId', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
  //     core: { name: 'core', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
  //     name: { name: 'name', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
  //     globalTimeStamp: { name: 'globalTimeStamp', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
  //     id: { name: 'id', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
  //     parameters: { name: 'parameters', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
  //     timestamp: { name: 'timestamp', type: 'string', entity: 'nonphysical', operators: ["==", "!=", ">", "<", "<="] },
  //   }
  // };
  public entityConfig!: QueryBuilderConfig;
  public config!: QueryBuilderConfig;
  public currentConfig: QueryBuilderConfig;
  public allowRuleset: boolean = true;
  public allowCollapse!: boolean;
  public persistValueOnFieldChange: boolean = false;
  public settings: any;
  private typeOperatorMap: { [key: string]: string[] } = {
  };

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.typeOperatorMap['number'] = ["==", "!=", ">=", "<=", "Between"];
    this.typeOperatorMap['string'] = ["Contains", "Not Contains", "IsNull", "IsNotNull"];
    this.queryCtrl = this.formBuilder.control(this.query);
    this.settings = {
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
      types: CoreConfig.types,
      settings: CoreConfig.settings,
      fields: fields,
      ctx: CoreConfig.ctx
    }
    let atrbts: any = {};
    for (let key in fields) {
      let field = fields[key as keyof typeof fields];
      let type = field.type == "text" ? "string" : field.type;
      let label = field.label;
      let defaultValue: any = [];
      let operators = this.typeOperatorMap[type]
        ;
      if (label && operators && type) {
        atrbts[key] = { defaultValue: defaultValue, name: label, type: type, operators: operators }
      }
    }
    this.config = { fields: atrbts }
    this.entityConfig = { fields: atrbts }
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
      operator = operator == "Between" ? "<=" : operator;
      if (query["field"] && query["value"]) {
        operator = (operator == "Contains") ? "#in" : operator;
        if (operator == "IsNull") {
          jsonLogic["=="] = [{ var: query["field"] }, null];
        } else if (operator == "IsNotNull") {
          jsonLogic["!="] = [{ var: query["field"] }, null];
        }
        else if (operator == "Not Contains") {
          jsonLogic["!"] = {
            "#in": [{ var: query["field"] }, query["value"]]
          }
        } else {
          jsonLogic[operator] = [{ var: query["field"] }, query["value"]];
        }
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
    let tree: ImmutableTree | undefined = loadFromJsonLogic(query, this.settings);
    if (tree != undefined) {
      return elasticSearchFormat(tree, this.settings, "ES_7_SYNTAX");
    }
    return null
  }
  loadFields() { }
}
