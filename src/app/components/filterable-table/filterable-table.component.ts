import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Input,
  QueryList,
  ViewChild,
  TemplateRef,
  ViewEncapsulation,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MatColumnDef,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { DataSource } from '@angular/cdk/collections';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatFormField } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';

export interface FilterField {
  name: string;
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'boolean' | 'number';
  options?: { label: string, value: any }[];
  placeholder?: string;
}

@Component({
  selector: 'filterable-table',
  standalone: true,
  imports: [MatOptionModule, MatCheckboxModule, MatFormField, MatProgressSpinner, MatTable, ReactiveFormsModule, MatInputModule, MatSelectModule, CommonModule],
  templateUrl: './filterable-table.component.html',
  styleUrl: './filterable-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'filterable-table',
    'role': 'region',
    '[attr.aria-label]': 'ariaLabel'
  }
})
export class FilterableTableComponent<T> implements AfterContentInit, OnInit, OnChanges {

  // Filter bar intergartion 
  @Input() filterFields: FilterField[] = [];
  @Input() filterInitialValue: any = {};
  @Output() filterChange = new EventEmitter<any>();
  filterForm!: FormGroup;

  //  Filter table 
  @ContentChildren(MatHeaderRowDef) headerRowDefs?: QueryList<MatHeaderRowDef>;
  @ContentChildren(MatRowDef) rowDefs?: QueryList<MatRowDef<T>>;
  @ContentChildren(MatColumnDef) columnDefs?: QueryList<MatColumnDef>;
  @ContentChild(MatNoDataRow) noDataRow?: MatNoDataRow;

  @ViewChild(MatTable, { static: true }) table?: MatTable<T>;

  @Input() columns: string[] = [];

  @Input() dataSource:
    | readonly T[]
    | DataSource<T>
    | Observable<readonly T[]>
    | null = null;
  tableDataSource: MatTableDataSource<T> | null = null;
  @Input() isLoading: boolean | null = false;
  @Input() ariaLabel: String = 'Data table';
private formSub?: Subscription;
  @Output() rowClick = new EventEmitter<T>();
  @ContentChild('loading', { read: TemplateRef }) loadingTemplate?: TemplateRef<any>;
  @ContentChild('empty', { read: TemplateRef }) emptyTemplate?: TemplateRef<any>;

  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.initFilterForm();
    console.log('filterForm controls:', this.filterForm.controls);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['filterFields'] && !changes['filterFields'].firstChange) ||
      (changes['filterInitialValue'] && !changes['filterInitialValue'].firstChange)) {
      this.initFilterForm();
    }
    if (changes['columns'] && !changes['columns'].firstChange) {
      this.table?.renderRows();
    }
  }


  public ngAfterContentInit(): void {
    this.columnDefs?.forEach((columnDef) =>
      this.table?.addColumnDef(columnDef)
    );
    this.rowDefs?.forEach((rowDef) => this.table?.addRowDef(rowDef));
    this.headerRowDefs?.forEach((headerRowDef) =>
      this.table?.addHeaderRowDef(headerRowDef)
    );
    this.table?.setNoDataRow(this.noDataRow ?? null);
  }

  
  private initFilterForm() {
    if (this.formSub) {
      this.formSub.unsubscribe(); // Clean up previous subscriptions!
    }
    const group: any = {};
    for (const field of this.filterFields) {
      let defaultValue: any;
      if (this.filterInitialValue[field.name] !== undefined) {
        defaultValue = this.filterInitialValue[field.name]
      } else {
        switch (field.type) {
          case 'multiselect':
            defaultValue = [];
            break;
          case 'select':
            defaultValue = '';
            break;
          case 'boolean':
            defaultValue = false;
            break;
          case 'number':
            defaultValue = null;
            break;
          default:
            defaultValue = '';
            break;
        }
      }
      group[field.name] = [defaultValue]
    }
    this.filterForm = this.fb.group(group);
    this.cd.markForCheck();
     this.formSub = this.filterForm.valueChanges.subscribe(value => {
      console.log('Filter value changed:', value);
      this.filterChange.emit(value);
    });

    this.filterChange.emit(this.filterForm.value);
  }

  resetFilter() {
    this.filterForm.reset();
    this.filterChange.emit(this.filterForm.value);
  }

  trackByIndex(index: number, item: T): any {
    return (item as any)?.id || index;
  }

  onRowClick(item: T): void {
    this.rowClick.emit(item);
  }
}