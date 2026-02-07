'use client';

import { Suspense, useEffect, useState } from 'react';
import { DataTable } from '@/components/DataTable';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { useSearchParams } from 'next/navigation';

// We don't know the exact schema, so we'll infer columns dynamically or use generic
// Ideally we'd scan the first row to determine keys.
type DataRow = Record<string, any>;

function DataPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ totalPages: 1, page: 1 });
  const [columns, setColumns] = useState<ColumnDef<DataRow>[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        const res = await fetch(`/api/data?${params.toString()}`);
        const result = await res.json();

        if (result.data) {
          setData(result.data);
          setMeta(result.meta);

          // Generate columns from data keys if data exists
          // Note: This assumes all rows have similar keys or first row resembles the schema
          // Generate columns from headers if available, or fallback to data keys
          if (columns.length === 0) {
            const keys = result.headers || (result.data.length > 0 ? Object.keys(result.data[0]) : []);

            if (keys.length > 0) {
              const cols = keys.map((key: string) => {
                const lowerKey = key.toLowerCase();
                const isImage =
                  lowerKey.includes('photo upload') ||
                  lowerKey.includes('passport copy front') ||
                  lowerKey.includes('passport copy back') ||
                  lowerKey.includes('photo (passport size)') ||
                  lowerKey.includes('passport photo (front)') ||
                  lowerKey.includes('passport photo (back)') ||
                  lowerKey.includes('aadhar image') ||
                  lowerKey.includes('pancard image') ||
                  lowerKey.includes('bank pasbook');

                return {
                  accessorFn: (row: DataRow) => row[key],
                  id: key,
                  header: key,
                  cell: ({ getValue }: any) => {
                    const val = getValue();
                    if (isImage && val && typeof val === 'string' && val.startsWith('http')) {
                      return (
                        <div className="h-16 w-16 relative overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={val}
                            alt={key}
                            className="object-cover w-full h-full hover:scale-110 transition-transform duration-200 cursor-zoom-in"
                            onClick={() => window.open(val, '_blank')}
                          />
                        </div>
                      );
                    }
                    return val;
                  }
                };
              });

              // Add Edit Column
              cols.push({
                accessorFn: (row: any) => row['Sl No.'], // Dummy accessor to satisfy type
                id: 'actions',
                header: 'Actions',
                cell: ({ row }: any) => {
                  const slNo = row.original['Sl No.'] || row.original['Sl No'];
                  return (
                    <Link href={`/edit?id=${slNo}`} className="text-indigo-600 hover:text-indigo-900 transition-colors p-2 rounded-full hover:bg-slate-100 block w-fit">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </Link>
                  );
                }
              });

              setColumns(cols);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-white relative selection:bg-indigo-50 selection:text-indigo-900 font-sans text-slate-900">
      <div className="relative bg-white z-10 w-full max-w-[1500px] mx-auto px-6 py-6 sm:py-10 lg:px-8">
        <header className="flex flex-col sm:flex-row sm:items-end gap-6 pb-8 border-b border-gray-100">
          <Link
            href="/add"
            className="ml-auto group relative inline-flex items-center justify-end px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-slate-900 rounded-full hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
          >
            <span className="mr-2 text-md">+</span> Add New Entry
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
          </Link>
        </header>


        <section className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 p-1">
          <div className="bg-white rounded-[1.25rem] overflow-hidden">
            <DataTable
              columns={columns}
              data={data}
              pageCount={meta.totalPages}
              isLoading={isLoading}
            />
          </div>
        </section>

        <footer className="mt-16 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} Travel Data Management. Secure & Private.
        </footer>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataPage />
    </Suspense>
  );
}
