import { FormBuilder, FormControl } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { QueryBuilderClassNames, QueryBuilderConfig } from './public-api';
import { Utils, CoreConfig } from "./core/modules";
import * as fields from '../../../assets/fields.json';

@Component({
  selector: 'app-universal-query-builder',
  templateUrl: './universal-query-builder.component.html',
  styleUrls: ['./universal-query-builder.component.css']
})
export class UniversalQueryBuilderComponent implements OnInit {
  @Input() fields: any = {};
  @Input() showDsl: boolean = false;
  @Input() showJsonlogic: boolean = false;
  @Input() showSql: boolean = false;
  @Input() showQueryBuilder: boolean = false;
  @Input() showQueryGenerator: boolean = false;
  @Input() showTree: boolean = false;
  @Input()
  onQueryCreated!: (query: any, jsonLogic: any) => void;
  @Input() expression: any;


  public queryCtrl: FormControl | any;
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
  public populateJsonlogicCallback = this.populateJsonlogic.bind(this);
  private query: any = {
    condition: "and",
    rules: []
  };
  private typeOperatorMap: { [key: string]: string[] } = {
  };
  constructor(
    private formBuilder: FormBuilder
  ) {
    this.typeOperatorMap['multi_level'] = ["==", "!=", ">=", "<=", ">", "<", "Equals", "Not Equals", "Contains", "Starts With", "Does Not Start With", "Ends With", "Does Not End With", "Not Contains", "Exists", "Does Not Exist",];
    this.typeOperatorMap['json_path'] = ["==", "!=", ">=", "<=", ">", "<", "Equals", "Not Equals", "Contains", "Starts With", "Does Not Start With", "Ends With", "Does Not End With", "Not Contains", "Exists", "Does Not Exist",];
    this.typeOperatorMap['number'] = ["==", "!=", ">=", "<=", ">", "<",];
    this.typeOperatorMap['string'] = ["Equals", "Not Equals", "Contains", "Starts With", "Does Not Start With", "Ends With", "Does Not End With", "Not Contains", "Exists", "Does Not Exist",];
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
    atrbts = this.getConfig(fields);
    this.config = { fields: atrbts }
    this.entityConfig = { fields: atrbts }
    this.currentConfig = this.config;
  }
  ngOnInit(): void {
    if (this.expression) {
      for (let key in this.expression) {
        this.query[key] = this.expression[key];
      }
    }
  }

  switchModes(event: Event) {
    this.currentConfig = (<HTMLInputElement>event.target).checked ? this.entityConfig : this.config;
  }

  changeDisabled(event: Event) {
    (<HTMLInputElement>event.target).checked ? this.queryCtrl.disable() : this.queryCtrl.enable();
  }
  populateJsonlogic() {
    const {
      getDSLQuery
    } = Utils;
    this.varJsonLogic = {};
    this.dsl = getDSLQuery(this.query, fields, this.varJsonLogic);
    if (this.onQueryCreated) {
      this.onQueryCreated(this.dsl, this.query);
    }
  }
  getConfig(fields: any) {
    let atrbts: any = { "select": { defaultValue: undefined, name: "---select---", type: undefined, operators: undefined, children: [] } };
    for (let key in fields) {
      let field = fields[key as keyof typeof fields];
      let type = field.type == "text" ? "string" : field.type;
      let label = field.label;
      let children = field.children;
      let defaultValue: any = [];
      let operators = this.typeOperatorMap[type];
      if (operators && type) {
        atrbts[key] = { defaultValue: defaultValue, name: label, type: type, operators: operators, children: (children) ? this.convertJsonToArray(this.getConfig(children)) : [] }
      }
    }
    return atrbts;
  }

  convertJsonToArray(fields: any) {
    var result: any[] = [];
    var keys = Object.keys(fields);
    keys.forEach(function (key) {
      let field = fields[key];
      field.value = key;
      result.push(field);
    });
    return result;
  }

}
