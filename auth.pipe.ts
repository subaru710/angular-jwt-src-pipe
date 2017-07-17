import {
  Pipe,
  PipeTransform,
  OnDestroy,
  WrappedValue,
  ChangeDetectorRef
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {ResponseContentType} from '@angular/http';

import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';
import {Subscriber} from 'rxjs/Subscriber';

import {AuthHttp} from 'angular2-jwt';

@Pipe({
  name: 'auth',
  pure: false
})
export class AuthPipe implements PipeTransform, OnDestroy {
  private _latestValue: any = null;
  private _latestReturnedValue: any = null;
  private _subscription: Subscription = null;
  private _obj: Observable<any> = null;

  private previousUrl: string;
  private _result: BehaviorSubject<any> = new BehaviorSubject(null);
  private result: Observable<any> = this._result.asObservable();
  private _internalSubscription: Subscription = null;

  constructor(private _ref: ChangeDetectorRef,
              private authHttp: AuthHttp,
              private sanitizer: DomSanitizer) {
  }

  ngOnDestroy(): void {
    if (this._subscription) {
      this._dispose();
    }
  }

  get(url: string): Observable<any> {
    return new Observable((observer: Subscriber<any>) => {
      let objectUrl: string = null;

      this.authHttp
        .get(url, {
          responseType: ResponseContentType.Blob
        })
        .subscribe(m => {
          objectUrl = URL.createObjectURL(m.blob());
          observer.next(objectUrl);
        });

      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
      };
    });
  }

  transform(url: string): any {
    const obj = this.internalTransform(url);
    return this.asyncTransform(obj);
  }

  private internalTransform(url: string): Observable<any> {
    if (!url) {
      return this.result;
    }

    if (this.previousUrl !== url) {
      this.previousUrl = url;
      this._internalSubscription = this.get(url).subscribe(m => {
        const sanitized = this.sanitizer.bypassSecurityTrustUrl(m);
        this._result.next(sanitized);
      });
    }

    return this.result;
  }

  private asyncTransform(obj: Observable<any>): any {
    if (!this._obj) {
      if (obj) {
        this._subscribe(obj);
      }
      this._latestReturnedValue = this._latestValue;
      return this._latestValue;
    }
    if (obj !== this._obj) {
      this._dispose();
      return this.asyncTransform(obj);
    }
    if (this._latestValue === this._latestReturnedValue) {
      return this._latestReturnedValue;
    }
    this._latestReturnedValue = this._latestValue;
    return WrappedValue.wrap(this._latestValue);
  }

  private _subscribe(obj: Observable<any>) {
    const _this = this;
    this._obj = obj;

    this._subscription = obj.subscribe({
      next: function (value) {
        return _this._updateLatestValue(obj, value);
      }, error: (e: any) => {
        throw e;
      }
    });
  }

  private _dispose() {
    this._subscription.unsubscribe();
    this._internalSubscription.unsubscribe();
    this._internalSubscription = null;
    this._latestValue = null;
    this._latestReturnedValue = null;
    this._subscription = null;
    this._obj = null;
  }

  private _updateLatestValue(async: any, value: Object) {
    if (async === this._obj) {
      this._latestValue = value;
      this._ref.markForCheck();
    }
  }
}
