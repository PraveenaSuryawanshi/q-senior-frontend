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
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { Observable } from 'rxjs';
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
import { MatPaginator, MatPaginatorModule , PageEvent } from '@angular/material/paginator';

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
  imports: [MatOptionModule, MatPaginatorModule, MatCheckboxModule, MatFormField, MatProgressSpinner, MatTable, ReactiveFormsModule, MatInputModule, MatSelectModule, CommonModule],
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
export class FilterableTableComponent<T> implements  AfterContentInit, AfterViewInit, OnInit, OnChanges {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

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

  currentPage = 0;
  pageSize = 5;
  pageSizeOptions = [5, 10, 25, 100];
  totalItems = 0; 

  @Output() rowClick = new EventEmitter<T>();
  @Output() pageChange = new EventEmitter<{ pageIndex: number, pageSize: number }>();
  @ContentChild('loading', { read: TemplateRef }) loadingTemplate?: TemplateRef<any>;
  @ContentChild('empty', { read: TemplateRef }) emptyTemplate?: TemplateRef<any>;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initFilterForm();
    this.setupDataSource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterInitialValue'] && !changes['filterInitialValue'].firstChange) {
      this.initFilterForm();
    }
    if (changes['columns'] && !changes['columns'].firstChange) {
      this.table?.renderRows();
    }
    if (changes['dataSource'] && !changes['dataSource'].firstChange) {
      this.setupDataSource();
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

  ngAfterViewInit(): void {
    
    if (this.tableDataSource && this.paginator) {
      this.tableDataSource.paginator = this.paginator;
    }
  }

  
  private initFilterForm() {
    const group: any = {};
    for (const field of this.filterFields) {
      group[field.name] = [this.filterInitialValue[field.name] ?? (field.type === 'multiselect' ? [] : '')]
    }
    this.filterForm = this.fb.group(group);
    this.filterForm.valueChanges.subscribe(value => this.filterChange.emit(value));
    this.filterChange.emit(this.filterForm.value);
  }

  private setupDataSource() {
    if (Array.isArray(this.dataSource)) {
      this.tableDataSource = new MatTableDataSource<T>(this.dataSource);
      this.totalItems = this.dataSource.length;
      if (this.paginator) {
        this.tableDataSource.paginator = this.paginator;
      }
    } else {
      this.tableDataSource = null;
    }
  }

  onPageChange(event: PageEvent) {
  this.pageSize = event.pageSize;
  this.currentPage = event.pageIndex;
  this.pageChange.emit({ pageIndex: this.currentPage, pageSize: this.pageSize });
}

   loadPage(pageIndex: number, pageSize: number) {
    this.pageChange.emit({ pageIndex, pageSize });
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