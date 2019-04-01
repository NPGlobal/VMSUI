import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { OriginService } from '../Services/origin.service';

export class HttpErrorInterceptor implements HttpInterceptor {

    userid: string;
    private _originService: OriginService;
    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.CheckSession();
        this.SetUserId();

        const headers = request.headers.set('userid', this.userid);
        request = request.clone({
            headers: headers
        });

        return next.handle(request)
            .pipe(
                retry(1),
                catchError((error: HttpErrorResponse) => {
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
        const url = window.location.pathname.toLowerCase();
        if (url.indexOf('login') > 0 || url.indexOf('welcome') > 0 || url === '/') {
        } else {
            if (typeof (Storage) !== undefined) {
                if (sessionStorage.getItem('userid') === null || sessionStorage.getItem('userid') === 'null') {
                    const redirecturl = this._originService.GetOriginWithSubDirectoryPath();
                    window.location.href = redirecturl;
                } else {
                    // alert('1');
                }
            } else {
                // alert('3');
            }
        }
    }
}
