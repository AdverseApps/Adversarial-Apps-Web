"use client";
import { DataGrid, GridRowsProp, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import React from 'react';

interface ReviewedCompany {
    cik: string;
    riskScore: number | null;
    lastVerified: string | null;
    entityName: string;
}
interface ReviewedCompaniesTableProps {
    reviewedCompanies: ReviewedCompany[];
}

export function ReviewedCompaniesTable({ reviewedCompanies }: ReviewedCompaniesTableProps) {
    const apiRef = useGridApiRef();

    const formattedCompanies = reviewedCompanies.map((row, index) => ({
        id: index, // Needed for DataGrid
        cik: row.cik,
        entityName: row.entityName,
        riskScore: row.riskScore,
        lastVerified: row.lastVerified ? new Date(row.lastVerified).toLocaleDateString() : 'N/A',
    }));

    const columns: GridColDef[] = [
        { field: 'entityName', headerName: 'Entity Name', width: 250, flex: 2 },
        { field: 'cik', headerName: 'CIK', width: 150, flex: 1 },
        { field: 'riskScore', headerName: 'Risk Score', width: 120, flex: 1 },
        { field: 'lastVerified', headerName: 'Last Verified', width: 180, flex: 1 },
    ];

    const rows: GridRowsProp = formattedCompanies.map((company, index) => ({
        id: index,
        entityName: company.entityName,
        cik: company.cik,
        riskScore: company.riskScore,
        lastVerified: company.lastVerified,
    }));

    return (
        <div className="h-[500px] w-4/5 text-[#f0f0f0]">
            <h1 className="text-4xl mt-12 ml-6 text-center mb-4">
                Reviewed SEC Companies
            </h1>
            <p className="text-center">The table below showcases SEC companies that have been reviewed by our team.
                If the company you're looking for is not listed, please use the search bar above to find it and submit a review request so that our team can evaluate it.</p>
            <p className="text-center mb-4">Please note that only SEC companies will appear in the table. For SAM companies, please use the search bar above instead.</p>
            <DataGrid
                apiRef={apiRef}
                rows={rows}
                columns={columns}
                getRowId={(row) => row.id}
                sx={{
                    '& .MuiDataGrid-row:nth-child(even)': {
                        backgroundColor: '#1e1e1e',
                    },
                    '& .MuiDataGrid-cell': {
                        borderColor: '#333',
                        color: '#f0f0f0', // Ensure cell text is white
                    },
                    '& .MuiDataGrid-footerContainer': {
                        backgroundColor: 'white',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#1e3b8b',
                    },
                }}
                initialState={{
                    sorting: {
                        sortModel: [{ field: 'lastVerified', sort: 'desc' }],
                    },
                }}
            />
        </div>
    );
}