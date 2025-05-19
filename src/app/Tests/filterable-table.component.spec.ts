import { FilterableTableComponent, FilterField } from '../components/filterable-table/filterable-table.component';
import { FormBuilder } from '@angular/forms';

describe('FilterableTableComponent', () => {
    let component: FilterableTableComponent<any>;

    const filterFields: FilterField[] = [
        { id: 'name', name: 'name', label: 'Name', type: 'text', placeholder: 'Search by name' },
        {
            id: 'type', name: 'type', label: 'Type', type: 'multiselect', options: [
                { label: 'Equity', value: 'Equity' },
                { label: 'BankAccount', value: 'BankAccount' }
            ]
        },
        {
            id: 'currency', name: 'currency', label: 'Currency', type: 'select', options: [
                { label: 'USD', value: 'USD' },
                { label: 'EUR', value: 'EUR' }
            ]
        },
        { id: 'isPrivate', name: 'isPrivate', label: 'Private', type: 'boolean' },
    ];

    beforeEach(() => {
        const cdRef = { markForCheck: () => { } } as any;
        component = new FilterableTableComponent<any>(new FormBuilder(), cdRef);
        component.filterFields = filterFields;
        component.columns = ['name', 'type', 'currency'];
        component.dataSource = [
            { id: 1, name: 'A', type: 'Equity', currency: 'USD' },
            { id: 2, name: 'B', type: 'BankAccount', currency: 'EUR' }
        ];
        component.ngOnInit();
    });

    it('should create the filterable table component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize filterForm with filterFields', () => {
        expect(component.filterForm).toBeTruthy();
        expect(component.filterForm.contains('name')).toBeTrue();
        expect(component.filterForm.contains('type')).toBeTrue();
        expect(component.filterForm.contains('currency')).toBeTrue();
        expect(component.filterForm.contains('isPrivate')).toBeTrue();
    });

    it('should emit filterChange when filter value changes', (done) => {
        component.filterChange.subscribe(value => {
            expect(value.name).toBe('Demo');
            done();
        });
        component.filterForm.get('name')?.setValue('Demo');
    });

    it('should reset filter values to default on resetFilter()', () => {
        component.filterForm.get('name')?.setValue('Demo');
        component.filterForm.get('type')?.setValue(['Equity']);
        component.filterForm.get('currency')?.setValue('USD');
        component.filterForm.get('isPrivate')?.setValue(true);
        component.resetFilter();
        expect(component.filterForm.get('name')?.value).toBeNull();
        expect(component.filterForm.get('type')?.value).toBeNull();;
        expect(component.filterForm.get('currency')?.value).toBeNull();
        expect(component.filterForm.get('isPrivate')?.value).toBeNull();
    });

    it('should track by id if present, else by index', () => {
        const rowWithId = { id: 5, name: 'Apple' };
        const rowWithoutId = { name: 'Demo' };
        expect(component.trackByIndex(1, rowWithId)).toBe(5);
        expect(component.trackByIndex(2, rowWithoutId)).toBe(2);
    });

    it('should call rowClick.emit when onRowClick is called', () => {
        spyOn(component.rowClick, 'emit');
        const row = { id: 3, name: 'Demo' };
        component.onRowClick(row);
        expect(component.rowClick.emit).toHaveBeenCalledWith(row);
    });
});