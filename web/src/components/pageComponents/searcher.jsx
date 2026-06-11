
const Searcher = ({ searchTerm, setSearchTerm, placeholder }) => {
    
    return (
        <div>
            <div>
                <input 
                type="text" 
                placeholder={placeholder}
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm} />
            </div>
        </div>
    );
}

export default Searcher;