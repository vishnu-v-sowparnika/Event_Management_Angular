import { Component, OnInit, Injector } from "@angular/core";

import { finalize } from "rxjs/operators";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import {
  PagedListingComponentBase,
  PagedRequestDto,
} from "shared/paged-listing-component-base";

import { CreateEventComponent } from "./create-event/create-event.component";
import { EditEventComponent } from "./edit-event/edit-event.component";
import { PermissionCheckerService } from "abp-ng2-module";
import {
  EventServiceServiceProxy,
  EventListDto,
  EventListDtoListResultDto,
  EventListDtoPagedResultDto,
  EventCreateDTO,
  EventUpdateDTO,
  RoleDto,
  RegistrationInputDto,
  RegistrationServiceServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { ActivatedRoute, Router } from "@angular/router";

class PagedEventsRequestDto extends PagedRequestDto {
  keyword: string;
}

@Component({
  selector: "app-events",
  templateUrl: "./events.component.html",
  animations: [appModuleAnimation()],
  styleUrls: ["./events.component.css"],
})
export class EventsComponent
  extends PagedListingComponentBase<EventListDto>
  implements OnInit {
  myEvents: EventListDto[] = [];
  keyword = "";
  isActive: boolean | null;
  advancedFiltersVisible = false;
  skipcount: number = 0;
  maxtotal: number = 10;
  isParticipant: boolean = false;
  isOrganiser: boolean = false;
  regevents: EventListDto[] = [];
  regeventIds: number[] = [];
  isRegeventnav: boolean = false;
  constructor(
    injector: Injector,
    private _eventService: EventServiceServiceProxy,
    private _modalService: BsModalService,
    private _permissionChecker: PermissionCheckerService,
    private _registrationService: RegistrationServiceServiceProxy,
    private route: Router
  ) {
    super(injector);
    //  this.getRegisteredEvents();
  }
  protected list(
    request: PagedEventsRequestDto,
    pageNumber: number,
    finishedCallback: Function
  ): void {
    //throw new Error("Method not implemented.");

    //this.getAll();
    // this.getAllPaged(
    //   undefined,
    //   this.keyword,
    //   request.skipCount,
    //   request.maxResultCount
    // );

    this._eventService
      .getAllPaged(
        undefined,
        this.keyword,
        request.skipCount,
        request.maxResultCount
      )
      .pipe(
        finalize(() => {
          finishedCallback();
        })
      )
      .subscribe((data: EventListDtoPagedResultDto) => {
        this.myEvents = data.items;
        this.totalItems = data.totalCount;
        this.showPaging(data, pageNumber);
      });
  }
  // protected delete(entity: EventListDto): void {
  //   throw new Error("Method not implemented.");
  // }

  delete(entity: EventListDto): void {
    // throw new Error("Method not implemented.");
    console.log("Event delete", entity);
    abp.message.confirm(
      this.l("EventDeleteWarningMessage", entity.description),
      undefined,
      (result: boolean) => {
        if (result) {
          this._eventService
            .deleteEvent(entity.id)
            .pipe(
              finalize(() => {
                abp.notify.success(this.l("SuccessfullyDeleted"));
                this.refresh();
              })
            )
            .subscribe(() => {});
        }
      }
    );
  }

  ngOnInit(): void {
    //this.getAll();
    this.checkPermission();
    console.log("url is", this.route.url);
    if (this.route.url == "/app/events") {
      this.getAllPaged(undefined, this.keyword, 0, 10);
    } else {
      this.isRegeventnav = true;
    }
    this.getRegisteredEvents();
  }

  checkPermission() {
    this.isParticipant = this._permissionChecker.isGranted("Pages.Participant");
    this.isOrganiser = this._permissionChecker.isGranted("Pages.Organiser");
  }

  getRegisteredEvents() {
    this._registrationService
      .getRegisteredEvents(undefined, undefined, undefined, 0, 10)
      .pipe(finalize(() => {}))
      .subscribe((data: EventListDtoPagedResultDto) => {
        if (!this.isRegeventnav) {
          this.regevents = data.items;
          console.log("regevents in subscribe", data);
          console.log("registrferd events", this.regevents);
          this.regeventIds = this.regevents.map((x) => x.id);
          console.log("registered event ids", this.regeventIds);
        } else {
          this.myEvents = data.items;
          this.totalItems = data.totalCount;
          this.showPaging(data, 1);
        }
      });
  }

  isNotregisteredEvent(id: number): boolean {
    console.log("Id recireved", id, "status ", this.regeventIds.includes(id));
    if (this.isRegeventnav) {
      return false;
    }
    if (this.regeventIds.includes(id)) {
      return false;
    } else {
      return true;
    }
  }

  registerforevent(myevent: EventListDto) {
    let id = myevent.id;
    console.log("Id clicked in register", id);
    let dto: RegistrationInputDto = new RegistrationInputDto();
    dto.eventId = myevent.id;

    this._registrationService
      .registerEvent(dto)
      .pipe(
        finalize(() => {
          abp.notify.success(this.l("SuccessfullyRegistered"));
          this.getRegisteredEvents();
          this.refresh();
        })
      )
      .subscribe((id: number) => {
        console.log("Registration Id", id);
      });
  }
  getAll() {
    this._eventService
      .getAll(undefined, undefined, 0, 10)
      .subscribe((data: EventListDtoListResultDto) => {
        console.log("Data get alll", data);
        this.myEvents = data.items;
      });
  }

  getAllPaged(cdId: String, key: String, skip: number, total: number) {
    this._eventService
      .getAllPaged(undefined, this.keyword, skip, total)
      .subscribe((data: EventListDtoPagedResultDto) => {
        this.myEvents = data.items;
        this.totalItems = data.totalCount;
      });
  }

  createEvent(): void {
    this.showCreateOrEditEventDialog();
  }

  editEvent(event: EventListDto): void {
    this.showCreateOrEditEventDialog(event.id);
  }

  showCreateOrEditEventDialog(id?: number): void {
    let createOrEditTenantDialog: BsModalRef;
    if (!id) {
      createOrEditTenantDialog = this._modalService.show(CreateEventComponent, {
        class: "modal-lg",
      });
    } else {
      createOrEditTenantDialog = this._modalService.show(EditEventComponent, {
        class: "modal-lg",
        initialState: {
          id: id,
        },
      });
    }

    createOrEditTenantDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
  }
}
