import { useNavigate } from "react-router";

function Backlink() {
  const navigate = useNavigate();

  return (
    <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }}>
      <span className="material-symbols--chevron-left w-16! h-16! text-body"></span>
    </a>
  );
}

export default Backlink;