export declare class InvoicesController {
    findAll(): Promise<{
        id: string;
        clientId: string;
        projectId: string;
        status: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        invoiceNumber: string;
        type: string;
        lineItems: import("@prisma/client/runtime/library").JsonValue;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        amountDue: import("@prisma/client/runtime/library").Decimal;
        dueDate: Date | null;
    }[] | {
        error: any;
    }>;
    create(body: any): Promise<{
        id: string;
        clientId: string;
        projectId: string;
        status: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        invoiceNumber: string;
        type: string;
        lineItems: import("@prisma/client/runtime/library").JsonValue;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        amountDue: import("@prisma/client/runtime/library").Decimal;
        dueDate: Date | null;
    } | {
        error: any;
    }>;
}
