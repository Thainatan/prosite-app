export declare class QuotesController {
    findAll(): Promise<{
        id: string;
        estimateNumber: string;
        clientId: string | null;
        projectId: string | null;
        serviceType: string;
        status: string;
        title: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
    }[] | {
        error: any;
    }>;
    create(body: any): Promise<{
        id: string;
        estimateNumber: string;
        clientId: string | null;
        projectId: string | null;
        serviceType: string;
        status: string;
        title: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
    } | {
        error: any;
    }>;
}
