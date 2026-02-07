'use client';

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from '@tanstack/react-table';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    isLoading: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    isLoading,
}: DataTableProps<TData, TValue>) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Search state
    const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

    // Debounce search
    // Debounce search
    useEffect(() => {
        const timeout = setTimeout(() => {
            const currentSearch = searchParams.get('search') || '';
            const value = searchValue || '';

            // Only update if search term changed
            if (currentSearch !== value) {
                const current = new URLSearchParams(Array.from(searchParams.entries()));
                if (value) {
                    current.set('search', value);
                } else {
                    current.delete('search');
                }
                current.set('page', '1'); // Reset to page 1 on search change

                const search = current.toString();
                const query = search ? `?${search}` : '';
                router.push(`${window.location.pathname}${query}`);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchValue, router, searchParams]);

    // Pagination state handled by URL, but we act on it via table instance if needed, 
    // or just use valid HTML links/buttons.
    // Here we just render buttons that update the URL.

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount,
    });

    const currentPage = parseInt(searchParams.get('page') || '1');

    const handlePageChange = (newPage: number) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('page', String(newPage));
        router.push(`${window.location.pathname}?${current.toString()}`);
    };

    // Scroll Sync Logic
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const topScrollRef = useRef<HTMLDivElement>(null);
    // const [tableWidth, setTableWidth] = useRef<number>(0); // Removed incorrect line
    const [scrollWidth, setScrollWidth] = useState(0);

    const isSyncingLeft = useRef(false);
    const isSyncingTop = useRef(false);

    useEffect(() => {
        const tableContainer = tableContainerRef.current;
        const topScroll = topScrollRef.current;

        if (!tableContainer || !topScroll) return;

        const handleTableScroll = () => {
            if (!isSyncingLeft.current) {
                isSyncingTop.current = true;
                topScroll.scrollLeft = tableContainer.scrollLeft;
            }
            isSyncingLeft.current = false;
        };

        const handleTopScroll = () => {
            if (!isSyncingTop.current) {
                isSyncingLeft.current = true;
                tableContainer.scrollLeft = topScroll.scrollLeft;
            }
            isSyncingTop.current = false;
        };

        // Measure width
        const resizeObserver = new ResizeObserver(() => {
            setScrollWidth(tableContainer.scrollWidth);
        });
        resizeObserver.observe(tableContainer);

        // Initial measure
        setScrollWidth(tableContainer.scrollWidth);

        tableContainer.addEventListener('scroll', handleTableScroll);
        topScroll.addEventListener('scroll', handleTopScroll);

        return () => {
            tableContainer.removeEventListener('scroll', handleTableScroll);
            topScroll.removeEventListener('scroll', handleTopScroll);
            resizeObserver.disconnect();
        };
    }, [data, columns]); // Re-run when data changes likely changing width

    return (
        <div className="space-y-0">
            {/* Search Header inside the card */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        placeholder="Search by passport, name, etc..."
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm hover:bg-white"
                    />
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                    <span className="font-semibold text-slate-700">{pageCount}</span> Total Pages
                </div>
            </div>

            {/* Top Scrollbar */}
            <div
                ref={topScrollRef}
                className="overflow-x-auto border-b border-slate-100 bg-slate-50/50"
                style={{ height: '12px' }} // Thin scrollbar area
            >
                <div style={{ width: `${scrollWidth}px`, height: '1px' }}></div>
            </div>

            <div
                ref={tableContainerRef}
                className="overflow-x-auto min-h-[400px]"
            >
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            {table.getHeaderGroups().map((headerGroup) => (
                                headerGroup.headers.map((header) => (
                                    <th key={header.id} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="h-48 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                        <span className="text-sm font-medium">Fetching details...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="group hover:bg-slate-50 transition-colors duration-150"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6 py-4 text-sm text-slate-600 group-hover:text-slate-900 whitespace-nowrap">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="h-48 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <span className="italic">No records found matching your search.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                    Showing page <span className="font-semibold text-slate-700">{currentPage}</span>
                </div>
                <div className="flex space-x-2">
                    <button
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || isLoading}
                    >
                        Previous
                    </button>
                    <button
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= pageCount || isLoading}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
