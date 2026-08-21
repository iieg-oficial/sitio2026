import { useNavigate } from "react-router";

function Backlink() {
  const navigate = useNavigate();

  return (
    <a className='w-[40px] h-[40px] rounded-full bg-white float-left shadow-2xs hover:bg-secondary group' href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }}>
      <span className="material-symbols--chevron-left w-10! h-10! text-secondary groud-hover:bg-white !"></span>
    </a>
  );
}

export default Backlink;