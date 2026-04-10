export declare class ProjectsController {
    findAll(): Promise<{
        id: string;
        clientId: string;
        serviceType: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        jobNumber: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        scopeOfWork: string | null;
        startDate: Date | null;
        estimatedCompletion: Date | null;
        managerId: string | null;
        estimatedValue: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
    }[] | {
        error: any;
    }>;
    create(body: any): Promise<{
        id: string;
        clientId: string;
        serviceType: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        jobNumber: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        scopeOfWork: string | null;
        startDate: Date | null;
        estimatedCompletion: Date | null;
        managerId: string | null;
        estimatedValue: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
    } | {
        error: any;
    }>;
}
