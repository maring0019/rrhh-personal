
function loggerMiddleware(req, res, next) {

    // console.log(`${request.method} ${request.path}`);
    // [TODO]: Log user activity
    next();
}

export default loggerMiddleware;