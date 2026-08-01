import React from 'react';
import DataTable, { FetchPageParams, FetchPageResult } from './DataTable';
import MasterTableRow from './TableEntries/MasterTableRow';
import GradModePlaceholder from './GradModePlaceholder';
import { UniversityData, ModeType } from "../../helpers/types";
import { ColumnType, ExtraSortType, SortType } from '../../helpers/DepartmentHelper';
import { universityColumns } from './UniversityTableColumns';
import { useFavorites } from '../../helpers/FavoritesContext';
import { compareFavorites } from '../../helpers/FavoritesHelper';

interface FavoritesTableProps {
  mode: ModeType;
  toggleMode: () => void;
  pageSize: number;
}

const FavoritesTable: React.FC<FavoritesTableProps> = ({ mode, toggleMode, pageSize = 10 }) => {
  const { favorites } = useFavorites();

  const fetchPage = async (params: FetchPageParams<SortType>): Promise<FetchPageResult<UniversityData>> => {
    const search = (params.search ?? '').toLowerCase();
    let filtered = favorites;
    if (search) {
      filtered = filtered.filter(
        (f) => f.name.toLowerCase().includes(search) || f.location.toLowerCase().includes(search)
      );
    }

    const sorted = [...filtered].sort((a, b) =>
      compareFavorites(a, b, params.sort, params.sortDept, params.sortExtra, mode)
    );

    const start = params.page * params.pageSize;
    return {
      items: sorted.slice(start, start + params.pageSize),
      total: sorted.length,
    };
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
      refreshSignal={favorites}
      RowComponent={MasterTableRow}
    />
  );
};

export default FavoritesTable;
