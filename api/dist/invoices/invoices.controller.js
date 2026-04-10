"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let InvoicesController = class InvoicesController {
    async findAll() { try {
        return await prisma.invoice.findMany({ orderBy: { createdAt: 'desc' } });
    }
    catch (e) {
        return { error: e.message };
    } }
    async create(body) { try {
        return await prisma.invoice.create({ data: { invoiceNumber: 'PS-INV-' + Date.now(), projectId: body.projectId, clientId: body.clientId, type: body.type || 'deposit', status: 'DRAFT', lineItems: body.lineItems || [], subtotal: body.subtotal || 0, total: body.total || 0, amountPaid: 0, amountDue: body.total || 0, createdById: body.createdById || 'system' } });
    }
    catch (e) {
        return { error: e.message };
    } }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "create", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, common_1.Controller)('invoices')
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map