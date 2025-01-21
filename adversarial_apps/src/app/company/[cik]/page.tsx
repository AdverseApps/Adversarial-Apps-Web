import { headers } from 'next/headers';
import {FetchSecData} from '@/app/lib/data';

interface CompanyDetailsProps {
    params: { cik: string };
  }
    
export default async function page ({ params }: CompanyDetailsProps){
    const { cik } = params;

    
    const result = await FetchSecData(cik)    
 
    
  return(
    <div className="flex justify-center mt-6">
      <div className="text-center text-xl">
  <h2>Details for CIK {cik}:</h2>
  <pre className="mt-4 text-left whitespace-pre-wrap">
    {JSON.stringify(result, null, 2)}
  </pre>
</div>
</div>
  )
}