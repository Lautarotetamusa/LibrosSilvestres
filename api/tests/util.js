import chai from 'chai';

export function expect_err_code(code, res){
    if(code != res.status)
        console.error(res.body);

    chai.expect(res.status).to.equal(code);
    chai.expect(res.body.success).to.be.false;
    chai.expect(res.body.error).to.exist;
}
export function expect_success_code(code, res){
    if (code != res.status)
        console.error(res.body);

    chai.expect(res.status).to.equal(code);
    chai.expect(res.body.success).to.be.true;
    chai.expect(res.body.error).to.not.exist;
}

function divide(a, b) {
    assert(b !== 0, "Divisor no puede ser cero");
    return a / b;
}

const assert = require('assert');

// Pruebas
console.log(divide(10, 2));  // Debería imprimir 5
console.log(divide(8, 0));   // Debería generar un AssertionError
