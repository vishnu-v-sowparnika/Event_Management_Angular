import {
  Component,
  Injector,
  OnInit,
  Output,
  EventEmitter,
} from "@angular/core";
import { finalize } from "rxjs/operators";
import { BsModalRef } from "ngx-bootstrap/modal";
import { AppComponentBase } from "@shared/app-component-base";
import {
  TenantServiceProxy,
  TenantDto,
} from "@shared/service-proxies/service-proxies";

import {
  EventUpdateDTO,
  EventServiceServiceProxy,
} from "@shared/service-proxies/service-proxies";

import * as moment from "moment";

@Component({
  selector: "app-edit-event",
  templateUrl: "./edit-event.component.html",
  styleUrls: ["./edit-event.component.css"],
})
export class EditEventComponent extends AppComponentBase implements OnInit {
  saving = false;
  tenant: TenantDto = new TenantDto();
  id: number;
  myevent: EventUpdateDTO = new EventUpdateDTO();
  eventdate: any;
  eventtime: any;
  stdate: any;
  sttime: any;
  eddate: any;
  edtime: any;
  @Output() onSave = new EventEmitter<any>();

  constructor(
    injector: Injector,
    public _tenantService: TenantServiceProxy,
    public _eventService: EventServiceServiceProxy,
    public bsModalRef: BsModalRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this._eventService.get(this.id).subscribe((result: EventUpdateDTO) => {
      this.myevent = result;
      this.eventdate = result.eventdate.format("yyyy/mm/dd");
      this.eventtime = result.eventdate.format("hh:mm ");
      this.stdate = result.reg_start_date.date();
      this.sttime = result.reg_start_date.format("hh:mm ");
      this.eddate = result.reg_end_date.date();
      this.edtime = result.reg_end_date.date();
      console.log("value in edit", this.eddate, "value ", this.edtime);
    });
  }

  save(): void {
    this.saving = true;

    //return console.log("my event in edit", this.myevent);

    this._eventService
      .updateEvent(this.myevent)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe(() => {
        this.notify.info(this.l("SavedSuccessfully"));
        this.bsModalRef.hide();
        this.onSave.emit();
      });
  }
}
