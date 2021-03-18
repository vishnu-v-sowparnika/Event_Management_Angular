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
  CreateTenantDto,
  TenantServiceProxy,
} from "@shared/service-proxies/service-proxies";

import {
  DlDateTimeDateModule,
  DlDateTimePickerModule,
} from "angular-bootstrap-datetimepicker";

import {
  EventCreateDTO,
  EventServiceServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { Variable } from "@angular/compiler/src/render3/r3_ast";
import * as moment from "moment";

@Component({
  selector: "app-create-event",
  templateUrl: "./create-event.component.html",
  styleUrls: ["./create-event.component.css"],
})
export class CreateEventComponent extends AppComponentBase implements OnInit {
  saving = false;
  tenant: CreateTenantDto = new CreateTenantDto();
  myevent: EventCreateDTO = new EventCreateDTO();
  testdate: DlDateTimeDateModule;
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
    this.tenant.isActive = true;
  }

  save(): void {
    this.saving = true;
    var ed = moment(this.eventdate + " " + this.eventtime).utcOffset("+05:30");
    var sd = moment(this.stdate + " " + this.sttime).utcOffset("+05:30");
    var end = moment(this.eddate + " " + this.edtime).utcOffset("+05:30");
    this.myevent.eventdate = ed;
    this.myevent.reg_start_date = sd;
    this.myevent.reg_end_date = end;
    console.log(
      "my event ",
      this.myevent,
      "date time",
      this.testdate,
      "evdate",
      this.eventdate,
      "ev time ",
      this.eventtime,
      " end time",
      end
    );
    this._eventService
      .createEvent(this.myevent)
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
    // this._tenantService
    //   .create(this.tenant)
    //   .pipe(
    //     finalize(() => {
    //       this.saving = false;
    //     })
    //   )
    //   .subscribe(() => {
    //     this.notify.info(this.l("SavedSuccessfully"));
    //     this.bsModalRef.hide();
    //     this.onSave.emit();
    //   });
  }
}
