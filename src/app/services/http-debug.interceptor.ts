import { HttpInterceptorFn, HttpResponse, HttpRequest } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const httpDebugInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🚀 HTTP Request Interceptor:');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  // Mostrar todos los headers con su case exacto
  console.log('All headers with exact case:');
  req.headers.keys().forEach(key => {
    console.log(`  ${key}: ${req.headers.get(key)}`);
  });

  console.log('Body:', req.body);

  // Verificar específicamente diferentes cases del header Authorization
  const authHeaderUpper = req.headers.get('Authorization');
  const authHeaderLower = req.headers.get('authorization');
  const authHeaderMixed = req.headers.get('AUTHORIZATION');

  console.log('Authorization header (upper):', authHeaderUpper ? `${authHeaderUpper.substring(0, 30)}...` : 'null');
  console.log('authorization header (lower):', authHeaderLower ? `${authHeaderLower.substring(0, 30)}...` : 'null');
  console.log('AUTHORIZATION header (mixed):', authHeaderMixed ? `${authHeaderMixed.substring(0, 30)}...` : 'null');

  // Verificar si es una solicitud preflight
  if (req.method === 'OPTIONS') {
    console.log('⚠️  This is a CORS preflight OPTIONS request!');
  }

  console.log('---');

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          console.log('✅ HTTP Response Success:');
          console.log('Status:', event.status);
          console.log('Status Text:', event.statusText);
          console.log('URL:', event.url);
          console.log('---');
        }
      },
      error: (error) => {
        console.log('❌ HTTP Response Error:');
        console.log('Status:', error.status);
        console.log('Status Text:', error.statusText);
        console.log('URL:', error.url);
        console.log('Message:', error.message);
        console.log('Error object:', error);
        console.log('---');
      }
    })
  );
};