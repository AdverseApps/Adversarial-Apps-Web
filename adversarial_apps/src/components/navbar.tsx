'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const links = [
    //Constant link to all pages 

    {name: 'Home', href: '/' },
    {
      name: 'Search',
      href: '/search',
    },
    {
        name: 'Education',
        href: '/Education',
      },
      {
        name: 'CRF Title 15',
        href: '/Education/cfr-title-15',
      }, 
      {
        name: 'SBIR Contract',
        href: '/Education/sbir',
      }, 
      {
        name: 'Due Diligence',
        href: '/Education/due-diligence',
      },
      {
        name: 'SAM Compliance',
        href: '/Education/sam-compliance',
      },
      {
        name: 'Reources',
        href: '/Education/resources',
      },
    ];
export default function NavBar() {
    const pathname = usePathname();
    return (
      <> 
        {/* FOR CHRISTIAN Finish making Navbar here 
        use the Link component in place of the <a> tag, 
        literally the same thing but Link is better*/}
      </>
    );
}