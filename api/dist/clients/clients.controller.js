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
exports.ClientsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    log: ['error', 'warn'],
});
let ClientsController = class ClientsController {
    async findAll() {
        try {
            const clients = await prisma.client.findMany({
                orderBy: { createdAt: 'desc' },
            });
            return clients;
        }
        catch (error) {
            console.error('CLIENTS ERROR:', error.message);
            return { error: error.message };
        }
    }
    async create(body) {
        try {
            return await prisma.client.create({
                data: {
                    firstName: body.firstName,
                    lastName: body.lastName,
                    email: body.email || null,
                    phone: body.phone,
                    address: body.address || '',
                    city: body.city || '',
                    state: body.state || 'FL',
                    zip: body.zip || '',
                    notes: body.notes || null,
                },
            });
        }
        catch (error) {
            console.error('CREATE CLIENT ERROR:', error.message);
            return { error: error.message };
        }
    }
};
exports.ClientsController = ClientsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "create", null);
exports.ClientsController = ClientsController = __decorate([
    (0, common_1.Controller)('clients')
], ClientsController);
//# sourceMappingURL=clients.controller.js.map