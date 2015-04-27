function ValidationError(errors, message) {
    this.errors = errors;
    this.message = message || 'Validation exception';
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

module.exports = ValidationError;