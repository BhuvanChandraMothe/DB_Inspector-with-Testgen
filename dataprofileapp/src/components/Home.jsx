import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { fetchDashboardSummary, fetchProfileResult } from "../api/dbapi";
import ProfilingResultsTable from "./ProfilingResultsTable";
import NewProfilingRunDialog from "./NewProfilingRUnDialog";

const DashboardCard = ({ title, value, subtitle, chartData }) => (
  <Paper elevation={3} sx={{ p: 3, borderRadius: 4, height: 150 }}>
    <Grid container spacing={2} alignItems="center" justifyContent="space-between">
      <Grid item xs={6}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Grid>
      <Grid item xs={6}>
        {chartData && (
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1976d2"
                strokeWidth={2}
                dot={false}
              />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Grid>
    </Grid>
  </Paper>
);

const Home = () => {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    connections: 0,
    table_groups: 0,
    profiling_runs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profilingResults, setProfilingResults] = useState(null);
  const [showResultsTable, setShowResultsTable] = useState(false);
  const [isNewRunDialogOpen, setIsNewRunDialogOpen] = useState(false); // New state

  const loadDashboardData = async () => {
    try {
      const data = await fetchDashboardSummary();
      const runs = data.runs.map((run, index) => ({
        id: index + 1,
        connection_id: run.connection_id,
        profiling_id: run.profiling_id,
        status: run.status,
        table_groups_id: run.table_groups_id,
        created_at: new Date(run.created_at).toLocaleString(),
      }));

      setSummary({
        connections: data.connections,
        table_groups: data.table_groups,
        profiling_runs: data.profiling_runs,
      });
      setRows(runs);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleProfilingClick = async (row) => {
    try {
      const data = await fetchProfileResult(row.connection_id, row.profiling_id);
      setProfilingResults(data);
      setShowResultsTable(true);
    } catch (error) {
      console.error("Failed to fetch profiling result", error);
    }
  };

  const handleOpenNewRunDialog = () => setIsNewRunDialogOpen(true);
  const handleCloseNewRunDialog = () => setIsNewRunDialogOpen(false);
  const handleNewRunSuccess = () => {
    handleCloseNewRunDialog();
    loadDashboardData(); // Reload data after a successful new run
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "connection_id", headerName: "Connection ID", flex: 1 },
    { field: "profiling_id", headerName: "Profiling ID", flex: 1 },
    { field: "table_groups_id", headerName: "Table Groups ID", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const status = params.value?.toUpperCase();
        let color = "warning";
        if (status === "COMPLETE") color = "success";
        else if (status === "ERROR") color = "error";
        return <Chip label={status} color={color} variant="outlined" />;
      },
    },
    { field: "created_at", headerName: "Created At", flex: 1 },
  ];

  const dummyChartData = [
    { date: "Day 1", value: 1 },
    { date: "Day 2", value: 2 },
    { date: "Day 3", value: 3 },
    { date: "Day 4", value: 2 },
    { date: "Day 5", value: 4 },
  ];

  return (
    <Box sx={{ p: 4 }}>
      {/* Top Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <DashboardCard
            title="Connections"
            value={summary.connections}
            subtitle="Active"
            chartData={dummyChartData}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardCard
            title="Table Groups"
            value={summary.table_groups}
            subtitle="Linked"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardCard
            title="Profiling Runs"
            value={summary.profiling_runs}
            subtitle="Total Executed"
          />
        </Grid>
      </Grid>

      {/* Profiling Runs Table Section */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Profiling Run Records</Typography>
          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleOpenNewRunDialog}
          >
            New Run
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">Error loading data.</Typography>
        ) : (
          <div style={{ height: 500, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableRowSelectionOnClick
              onRowClick={(params) => handleProfilingClick(params.row)}
            />
          </div>
        )}
      </Paper>

      {/* Profiling Results Section */}
      {showResultsTable && profilingResults && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Profiling Results
          </Typography>
          <ProfilingResultsTable profilingData={profilingResults} />
        </Box>
      )}

      {/* Dialog: New Profiling Run */}
      <NewProfilingRunDialog
        open={isNewRunDialogOpen}
        onClose={handleCloseNewRunDialog}
        onRunSuccess={handleNewRunSuccess}
      />
    </Box>
  );
};

export default Home;
