import React from 'react';
import DataTable, { FetchPageParams, FetchPageResult } from './DataTable';
import MasterTableRow from './TableEntries/MasterTableRow';
import GradModePlaceholder from './GradModePlaceholder';
import { UniversityData, ModeType } from "../../helpers/types";
import { ColumnType, ExtraSortType, SortType } from '../../helpers/DepartmentHelper';
import { universityColumns } from './UniversityTableColumns';

interface FavoritesTableProps {
  mode: ModeType;
  toggleMode: () => void;
  pageSize: number;
}

const FavoritesTable: React.FC<FavoritesTableProps> = ({ mode, toggleMode, pageSize = 10 }) => {
  const fetchPage = async (params: FetchPageParams<SortType>): Promise<FetchPageResult<UniversityData>> => {
    // Favorites endpoint not implemented yet
    throw new Error('API error: 501 (favorites endpoint not implemented yet)');
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
      RowComponent={MasterTableRow}
    />
  );
};

export default FavoritesTable;
