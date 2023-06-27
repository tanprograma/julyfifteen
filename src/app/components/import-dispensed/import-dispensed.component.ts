import { Component } from '@angular/core';
import { InventoryService } from 'src/app/services/inventory.service';
import { StoreService } from 'src/app/services/store.service';
import { Medicine } from 'src/app/medicine';
import { Store } from 'src/app/store';
import { Inventory } from 'src/app/inventory';
@Component({
  selector: 'app-import-dispensed',
  templateUrl: './import-dispensed.component.html',
  styleUrls: ['./import-dispensed.component.css'],
})
export class ImportDispensedComponent {
  interval!: any;

  constructor(
    private inventoryService: InventoryService,
    private storeService: StoreService
  ) {}
  ngOnInit(): void {
    this.getStores();
  }
  date: string = '';
  store: string = '';
  inventory: Inventory[] = [];
  medicines: Medicine[] = [];
  stores: Store[] = [];
  message: string = 'loading...';
  uploaded: any = [];
  submitted: number = 0;
  client: string = '';
  loading: boolean = false;
  success: boolean = true;
  toSubmit: any = [];
  prescription: Medicine = {
    name: '',
  };

  load(isLoading: boolean) {
    this.loading = isLoading;
  }
  add(x: HTMLInputElement) {
    if (!x.files) return;
    // console.log(x.files[0]);
    const reader = new FileReader();
    if (x.files.length) {
      reader.readAsText(x.files[0]);
      reader.onload = this.parseDispensed;
      x.value = '';
    }
  }
  getDate(index: number) {
    const date = new Date(this.date);
    return date.setDate(date.getDate() + index).valueOf();
  }
  parseDispensed = (e: any) => {
    const data: string = e.target.result;

    const headers = data.split('\r\n')[0].split(',');
    const dates = headers.slice(1).map((date, index) => {
      return this.getDate(index);
    });
    const body = data
      .split('\r\n')
      .slice(1)
      .map((i) => {
        const l = i.split(',');
        return {
          commodity: l[0].toUpperCase(),
          quantities: l
            .slice(1)
            .map((quantity, index) => {
              return {
                quantity: Number(quantity) ? Number(quantity) : 0,
                date: dates[index],
              };
            })
            .filter((z) => {
              return z.quantity > 0;
            }),
        };
      })
      .filter((i) => {
        return i.commodity.length != 0;
      })
      .filter((z) => {
        return z.quantities.length > 0;
      });

    // const x = { store: this.store, items: body };

    this.uploadDispensed(body);
  };
  uploadDispensed(x: any) {
    x.forEach((i: any) => {
      const found = this.inventory.find((v) => {
        return v.commodity == i.commodity?.toUpperCase();
      });
      if (!found) {
        return;
      }
      this.toSubmit.push(i);
    });
    // console.log({ this.toSubmit });
    if (!this.toSubmit.length) return;
    // console.log(this.toSubmit);

    this.loading = true;
    this.inventoryService
      .uploadDispensed({ store: this.store, items: this.toSubmit })
      .subscribe((i) => {
        this.submitted += this.toSubmit.length;
        if (!i.length) {
          this.loading = false;
          return;
        }

        this.display(i);
      });
  }
  display(i: any) {
    this.uploaded = [...this.uploaded, ...i];
    this.toSubmit = this.toSubmit.filter((x: any) => {
      const found = i.find((z: any) => {
        return x.commodity == z.commodity;
      });
      return !found == true;
    });
    this.loading = false;
    console.log({
      i,
      submitted: this.submitted,
      uploaded: this.uploaded.length,
    });
    if (!this.toSubmit.length) {
      this.success = true;
      return;
    }
    this.success = false;
  }
  uploadAgain() {
    this.inventoryService
      .uploadDispensed({ store: this.store, items: this.toSubmit })
      .subscribe((i) => {
        if (!i.length) {
          this.loading = false;
          return;
        }

        this.display(i);
      });
  }
  getDispensed() {
    this.loading = true;
    console.log({ store: this.store });
    this.inventoryService.getInventoryByStore(this.store).subscribe((i) => {
      this.inventory = i;
      console.log({ inventory: i });
      this.loading = false;
    });
  }
  getStores() {
    if (this.storeService.stores.length) {
      this.stores = this.storeService.stores;
      return;
    }
    this.loading = true;
    this.storeService.getStores().subscribe((i) => {
      this.stores = i;
      this.storeService.stores = i;
      this.loading = false;
    });
  }
}
