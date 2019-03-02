import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

export class HttpErrorInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.CheckSession();
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

    CheckSession() {
        const url = window.location.pathname.toLowerCase();
        if (url.indexOf('login') > 0 || url.indexOf('welcome') > 0 || url === '/') {
        } else {
            if (typeof(Storage) !== undefined) {
                if (sessionStorage.getItem('userid') === null || sessionStorage.getItem('userid') === 'null') {
                    const redirecturl = window.location.origin;
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
