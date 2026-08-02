import React from 'react';
import DataTable, { FetchPageParams, FetchPageResult } from './DataTable';
import MasterTableRow from './TableEntries/MasterTableRow';
import GradModePlaceholder from './GradModePlaceholder';
import { UniversityData, Content } from "../../helpers/types";
import { ModeType } from "../../helpers/types";
import { ExtraSortType, ColumnType, SortType } from '../../helpers/DepartmentHelper';
import { universityColumns } from './UniversityTableColumns';

export interface MasterTableProps {
  mode: ModeType;
  toggleMode: () => void;
  pageSize: number;
};

const API_BASE_URL = 'http://localhost:8000/api';

const MasterTable: React.FC<MasterTableProps> = ({ mode, toggleMode, pageSize = 10 }) => {
  const fetchPage = async (params: FetchPageParams<SortType>): Promise<FetchPageResult<UniversityData>> => {
    const query = new URLSearchParams();

    // Pagination (convert 0-indexed to 1-indexed)
    query.set('page', String(params.page + 1));
    query.set('pageSize', String(params.pageSize));

    // Search
    if (params.search) {
      query.set('search', params.search);
    }

    // Sort mapping
    if (params.sort === ExtraSortType.Alphabetical) {
      query.set('sort', 'name');
      query.set('sortDir', 'asc');
    } else if (params.sort === ExtraSortType.ReverseAlphabetical) {
      query.set('sort', 'name');
      query.set('sortDir', 'desc');
    } else {
      query.set('sort', params.sort);
      query.set('sortDir', params.sortExtra === 'least' ? 'asc' : 'desc');
    }

    // Department-specific sort
    if (params.sortDept && params.sortDept !== 'general') {
      query.set('sortDept', params.sortDept);
    }

    const response = await fetch(`${API_BASE_URL}/universities?${query.toString()}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return { items: result.universities, total: result.total };
  };

  //This function is currently not being used
  const fetchExpandedEntryContent = async (id: number): Promise<Content> => {
    // In a real implementation, this would be an actual API call:
    /*
    const response = await fetch(`/api/universities/${id}/content?type=${type}`);
    if (!response.ok) throw new Error('Failed to fetch content');
    const data = await response.json();
    return data.content;
    */

    // Simulation - matches your existing data structure
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({

          // In the future, if content is too much and page loads too slow, we can try to utilize this function
          // to load content for only one entry
        });
      }, 500);
    });
  };

  if (mode === ModeType.Grad) {
    return <GradModePlaceholder toggleMode={toggleMode} />;
  }

  return (
    <DataTable<UniversityData, ColumnType, SortType>
      mode={mode}
      toggleMode={toggleMode}
      pageSize={pageSize}
      columns={universityColumns}
      initialSortingCol={1}
      initialSortingParam={ExtraSortType.Alphabetical}
      fetchPage={fetchPage}
      onExpand={fetchExpandedEntryContent}
      RowComponent={MasterTableRow}
      stateKey="explore"
    />
  );
};

export default MasterTable;
