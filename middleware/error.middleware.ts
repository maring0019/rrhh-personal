// import HttpException from '../exceptions/HttpException';
import * as HttpStatus from 'http-status-codes';

function errorMiddleware(err, req, res, next) {
//   const status = error.status || 500;
//   const message = error.message || 'Something went wrong';
//   res
//     .status(status)
//     .send({
//       message,
//       status,
//     });
    let isError = (e) => {
        return e && e.stack && e.message;
    };
    if (err) {
        // Parse err
        let e: { status: number, message: string };
        if (!isNaN(err)) { // err es solo un numero (http status code)
            e = {
                message: HttpStatus.getStatusText(err),
                status: err
            };
        } else {
            if (isError(err)) {
                e = {
                    message: err.message,
                    status: 500
                };
            } else if (typeof err === 'string') {
                e = {
                    message: err,
                    status: 400
                };
            } else {
                e = {
                    message: JSON.stringify(err),
                    status: 400
                };
            }
        }

        // Send response
        res.status(e.status);
        res.send({
            message: e.message,
            error: err //(app.get('env') === 'development') ? err : null
        });
    }
}

export default errorMiddleware;