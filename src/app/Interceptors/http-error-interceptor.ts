import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse,
    HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';
import { OriginService } from '../Services/origin.service';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

    hitsCounter: number;
    userid: string;
    private _originService: OriginService;
    constructor(private _router: Router,
        private _spinnerService: NgxSpinnerService) {
        this.hitsCounter = 0;
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.hitsCounter++;
        if (this.hitsCounter === 1) {
            this._spinnerService.show();
        }

        this.CheckSession();
        this.SetUserId();

        const headers = request.headers.set('userid', this.userid);
        request = request.clone({
            headers: headers
        });

        return next.handle(request)
            .pipe(tap((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    this.hitsCounter--;
                    if (this.hitsCounter === 0) {
                        this._spinnerService.hide();
                    }
                }
            }),
                retry(1),
                catchError((error: HttpErrorResponse) => {
                    this._spinnerService.hide();
                    let errorMessage = '';
                    if (error.error instanceof ErrorEvent) {
                        // client-side error
                        errorMessage = 'Error: ${error.error.message}';
                    } else {
                        // server-side error
                        errorMessage = 'Error Code: ${error.status}\nMessage: ${error.message}';
                    }
                    // alert('We are facing some technical issues. Please contact administrator.');
                    return throwError(errorMessage);
                })
            );
    }

    SetUserId() {
        if (sessionStorage.getItem('userid') === null) {
            this.userid = null;
        } else {
            this.userid = sessionStorage.getItem('userid').toString();
        }
    }

    CheckSession() {
        if (typeof (Storage) !== undefined) {
            if (sessionStorage.getItem('userid') === undefined || sessionStorage.getItem('userid') === null) {
                this._router.navigate(['/login']);
            } else {
                // alert('1');
            }
        } else {
            // alert('3');
        }
        // const url = window.location.pathname.toLowerCase();
        // if (url.indexOf('login') > 0 || url.indexOf('welcome') > 0 || url === '/') {
        // } else {
        //     if (typeof (Storage) !== undefined) {
        //         if (sessionStorage.getItem('userid') === null || sessionStorage.getItem('userid') === 'null') {
        //             const redirecturl = this._originService.GetOriginWithSubDirectoryPath();
        //             window.location.href = redirecturl;
        //         } else {
        //             // alert('1');
        //         }
        //     } else {
        //         // alert('3');
        //     }
        // }
    }
}
