// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Grid,
//   Paper,
//   CircularProgress,
//   Chip,
//   Button,
// } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
// import { fetchDashboardSummary, fetchProfileResult } from "../api/dbapi";
// import ProfilingResultsTable from "./ProfilingResultsTable";
// import NewProfilingRunDialog from "./NewProfilingRUnDialog";
// import ConnectionsDialog from "./ConnectionDialog";



// const DashboardCard = ({ title, value, subtitle, chartData, onClick }) => (
//   <Paper
//     elevation={3}
//     sx={{
//       p: 3,
//       borderRadius: 4,
//       height: 150,
//       cursor: onClick ? "pointer" : "default",
//       "&:hover": onClick ? { boxShadow: 6 } : undefined,
//     }}
//     onClick={onClick}
//   >
//     <Grid container spacing={2} alignItems="center" justifyContent="space-between">
//       <Grid item xs={6}>
//         <Typography variant="subtitle2" color="text.secondary">
//           {title}
//         </Typography>
//         <Typography variant="h5" fontWeight="bold">
//           {value}
//         </Typography>
//         {subtitle && (
//           <Typography variant="caption" color="text.secondary">
//             {subtitle}
//           </Typography>
//         )}
//       </Grid>
//       <Grid item xs={6}>
//         {chartData && (
//           <ResponsiveContainer width="100%" height={60}>
//             <LineChart data={chartData}>
//               <Line
//                 type="monotone"
//                 dataKey="value"
//                 stroke="#1976d2"
//                 strokeWidth={2}
//                 dot={false}
//               />
//               <XAxis dataKey="date" hide />
//               <YAxis hide />
//               <Tooltip />
//             </LineChart>
//           </ResponsiveContainer>
//         )}
//       </Grid>
//     </Grid>
//   </Paper>
// );

// const Home = () => {
//   const [rows, setRows] = useState([]);
//   const [summary, setSummary] = useState({
//     connections: 0,
//     table_groups: 0,
//     profiling_runs: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);
//   const [profilingResults, setProfilingResults] = useState(null);
//   const [showResultsTable, setShowResultsTable] = useState(false);
//   const [isNewRunDialogOpen, setIsNewRunDialogOpen] = useState(false);
//   const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false); // ✅

//   const loadDashboardData = async () => {
//     try {
//       const data = await fetchDashboardSummary();
//       const runs = data.runs.map((run, index) => ({
//         id: index + 1,
//         connection_id: run.connection_id,
//         profiling_id: run.profiling_id,
//         status: run.status,
//         table_groups_id: run.table_groups_id,
//         created_at: new Date(run.created_at).toLocaleString(),
//       }));

//       setSummary({
//         connections: data.connections,
//         table_groups: data.table_groups,
//         profiling_runs: data.profiling_runs,
//       });
//       setRows(runs);
//     } catch (err) {
//       console.error("Dashboard fetch failed", err);
//       setError(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   const handleProfilingClick = async (row) => {
//     try {
//       const data = await fetchProfileResult(row.connection_id, row.profiling_id);
//       setProfilingResults(data);
//       setShowResultsTable(true);
//     } catch (error) {
//       console.error("Failed to fetch profiling result", error);
//     }
//   };

//   const handleOpenNewRunDialog = () => setIsNewRunDialogOpen(true);
//   const handleCloseNewRunDialog = () => setIsNewRunDialogOpen(false);
//   const handleNewRunSuccess = () => {
//     handleCloseNewRunDialog();
//     loadDashboardData();
//   };

//   const handleOpenConnectionDialog = () => setIsConnectionDialogOpen(true);
//   const handleCloseConnectionDialog = () => setIsConnectionDialogOpen(false);

//   const columns = [
//     { field: "id", headerName: "ID", width: 90 },
//     { field: "connection_id", headerName: "Connection ID", flex: 1 },
//     { field: "profiling_id", headerName: "Profiling ID", flex: 1 },
//     { field: "table_groups_id", headerName: "Table Groups ID", flex: 1 },
//     {
//       field: "status",
//       headerName: "Status",
//       flex: 1,
//       renderCell: (params) => {
//         const status = params.value?.toUpperCase();
//         let color = "warning";
//         if (status === "COMPLETE") color = "success";
//         else if (status === "ERROR") color = "error";
//         return <Chip label={status} color={color} variant="outlined" />;
//       },
//     },
//     { field: "created_at", headerName: "Created At", flex: 1 },
//   ];

//   const dummyChartData = [
//     { date: "Day 1", value: 1 },
//     { date: "Day 2", value: 2 },
//     { date: "Day 3", value: 3 },
//     { date: "Day 4", value: 2 },
//     { date: "Day 5", value: 4 },
//   ];

//   return (
//     <Box sx={{ p: 4 }}>
//       {/* Top Summary Cards */}
//       <Grid container spacing={3} mb={4}>
//         <Grid item xs={12} md={4}>
//           <DashboardCard
//             title="Connections"
//             value={summary.connections}
//             subtitle="Active"
//             chartData={dummyChartData}
//             onClick={handleOpenConnectionDialog} 
//           />
//         </Grid>
//         <Grid item xs={12} md={4}>
//           <DashboardCard
//             title="Table Groups"
//             value={summary.table_groups}
//             subtitle="Linked"
//           />
//         </Grid>
//         <Grid item xs={12} md={4}>
//           <DashboardCard
//             title="Profiling Runs"
//             value={summary.profiling_runs}
//             subtitle="Total Executed"
//           />
//         </Grid>
//       </Grid>

//       {/* Profiling Runs Table Section */}
//       <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
//         <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//           <Typography variant="h6">Profiling Run Records</Typography>
//           <Button
//             variant="outlined"
//             startIcon={<AddCircleOutlineIcon />}
//             onClick={handleOpenNewRunDialog}
//           >
//             New Run
//           </Button>
//         </Box>

//         {loading ? (
//           <Box display="flex" justifyContent="center" py={5}>
//             <CircularProgress />
//           </Box>
//         ) : error ? (
//           <Typography color="error">Error loading data.</Typography>
//         ) : (
//           <div style={{ height: 500, width: "100%" }}>
//             <DataGrid
//               rows={rows}
//               columns={columns}
//               pageSize={10}
//               rowsPerPageOptions={[10]}
//               disableRowSelectionOnClick
//               onRowClick={(params) => handleProfilingClick(params.row)}
//             />
//           </div>
//         )}
//       </Paper>

//       {/* Profiling Results Section */}
//       {showResultsTable && profilingResults && (
//         <Box mt={4}>
//           <Typography variant="h6" gutterBottom>
//             Profiling Results
//           </Typography>
//           <ProfilingResultsTable profilingData={profilingResults} />
//         </Box>
//       )}

//       {/* Dialogs */}
//       <NewProfilingRunDialog
//         open={isNewRunDialogOpen}
//         onClose={handleCloseNewRunDialog}
//         onRunSuccess={handleNewRunSuccess}
//       />
//       <ConnectionsDialog
//         open={isConnectionDialogOpen}
//         onClose={handleCloseConnectionDialog}
//       />
//     </Box>
//   );
// };

// export default Home;



import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    Chip,
    Button,
    Tooltip, // Import Tooltip from MUI
    useTheme, // Import useTheme
    Collapse, // Import Collapse for collapsible table
    IconButton, // Import IconButton for expand icon
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Import expand icon
import ChevronRightIcon from '@mui/icons-material/ChevronRight'; // Import collapse icon
import { DataGrid } from "@mui/x-data-grid";
import {
    LineChart, Line, XAxis, YAxis,
    ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip // Import Recharts components
} from "recharts";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
// Import necessary APIs - fetchDashboardSummary, fetchProfileResult, fetchLatestProfilingRun (though fetchLatestProfilingRun might be simplified or replaced)
import { fetchDashboardSummary, fetchProfileResult } from "../api/dbapi";
import ProfilingResultsTable from "./ProfilingResultsTable"; // Assuming this component is available
import NewProfilingRunDialog from "./NewProfilingRUnDialog"; // Assuming this component is available
import ConnectionsDialog from "./ConnectionDialog"; // Assuming this component is available
import ChartOverviewDialog from "./ChartOverviewDialog"; // Import the new dialog component
import { useNavigate } from "react-router-dom"; // Import useNavigate

const MAX_TOP = 5; // Number of top/bottom columns to display

// Define columns for the DataGrid outside the component
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


// Dashboard Card component (kept from previous version)
const DashboardCard = ({ title, value, subtitle, chartData, onClick }) => {
    const theme = useTheme(); // Use useTheme inside the component

    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                borderRadius: 4,
                height: 150,
                cursor: onClick ? "pointer" : "default",
                "&:hover": onClick ? { boxShadow: 6 } : undefined,
                // Add dark mode styles if not handled by theme Paper default
                bgcolor: theme.palette.background.paper,
                color: theme.palette.text.primary,
            }}
            onClick={onClick}
        >
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
                                    // Use theme primary color or a specific color
                                    stroke={theme.palette.primary.main}
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <XAxis dataKey="date" hide />
                                <YAxis hide />
                                {/* Tooltip from Recharts */}
                                <RechartsTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: 'none' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </Grid>
            </Grid>
        </Paper>
    );
};


const Home = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    // Define COLORS inside the component where theme is available
    const COLORS = [
        theme.palette.primary.main, // Use theme primary color
        theme.palette.secondary.main, // Use theme secondary color
        theme.palette.error.main,    // Use theme error color
        theme.palette.warning.main,  // Use theme warning color
        theme.palette.info.main,     // Use theme info color
        theme.palette.success.main,  // Use theme success color
        theme.palette.grey[500]      // Use a grey shade
    ];

    // State for Dashboard Summary and Run History Table
    const [rows, setRows] = useState([]); // Full list of run summaries for the table
    const [summary, setSummary] = useState({
        connections: 0,
        table_groups: 0,
        profiling_runs: 0,
    });

    // State for the Profiling Run data currently displayed in Charts
    const [displayedRunSummary, setDisplayedRunSummary] = useState(null); // Summary of the currently displayed run
    const [displayedProfileResults, setDisplayedProfileResults] = useState([]); // Detailed results for the currently displayed run

    // Loading and Error States (combined for initial load)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for Collapsible History Table
    const [isHistoryTableExpanded, setIsHistoryTableExpanded] = useState(false);

    // Dialog States
    const [isNewRunDialogOpen, setIsNewRunDialogOpen] = useState(false);
    const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
    // State for showing the detailed results table below the charts (when clicking a history row)
    const [showResultsTable, setShowResultsTable] = useState(false);
    const [profilingResultsDetailed, setProfilingResultsDetailed] = useState(null); // Data for detailed results table

    // State for Chart Overview Dialog
    const [isOverviewDialogOpen, setIsOverviewDialogOpen] = useState(false);
    const [overviewDialogTitle, setOverviewDialogTitle] = useState('');
    const [overviewDialogContent, setOverviewDialogContent] = useState(null); // Can be string or React Node


    // --- Data Fetching ---
    useEffect(() => {
        const loadDashboardInitialData = async () => {
            setLoading(true);
            setError('');
            try {
                // 1. Fetch summary data for top cards and run history table
                const summaryData = await fetchDashboardSummary();
                const runs = summaryData.runs.map((run) => ({
                    // Use profiling_id as unique id for DataGrid
                    id: run.profiling_id,
                    connection_id: run.connection_id,
                    profiling_id: run.profiling_id,
                    status: run.status,
                    table_groups_id: run.table_groups_id,
                    created_at: new Date(run.created_at).toLocaleString(),
                    // Include other summary fields if needed for displayedRunSummary
                    anomaly_ct: run.anomaly_ct,
                    anomaly_table_ct: run.anomaly_table_ct,
                    anomaly_column_ct: run.anomaly_column_ct,
                    dq_affected_data_points: run.dq_affected_data_points,
                    dq_total_data_points: run.dq_total_data_points,
                    dq_score_profiling: run.dq_score_profiling,
                    table_ct: run.table_ct,
                    column_ct: run.column_ct,
                }));

                setSummary({
                    connections: summaryData.connections,
                    table_groups: summaryData.table_groups,
                    profiling_runs: summaryData.profiling_runs,
                });
                setRows(runs); // Populate the history table rows

                // 2. Identify the most recent run
                const latestRunSummary = runs.length > 0 ? runs[0] : null; // Assuming runs are returned in most recent order

                // 3. Fetch detailed results for the most recent run (if any)
                if (latestRunSummary) {
                     try {
                        const latestRunResults = await fetchProfileResult(latestRunSummary.connection_id, latestRunSummary.profiling_id);
                        setDisplayedRunSummary(latestRunSummary);
                        setDisplayedProfileResults(latestRunResults);
                     } catch (fetchResultsError) {
                         console.error("Failed to fetch detailed results for latest run:", fetchResultsError);
                         // Display summary data but show an error for detailed results/charts
                         setDisplayedRunSummary(latestRunSummary); // Still show summary info if available
                         setDisplayedProfileResults([]); // No detailed results
                         setError('Failed to load detailed data for the latest run.');
                     }
                } else {
                     // No runs found at all
                     setError('No profiling runs found. Run a profiling job to see the dashboard.');
                     setDisplayedRunSummary(null);
                     setDisplayedProfileResults([]);
                }

            } catch (err) {
                console.error("Dashboard initial fetch failed", err);
                setError('Failed to load dashboard data.');
                 setDisplayedRunSummary(null);
                 setDisplayedProfileResults([]);
                 setRows([]);
                 setSummary({connections: 0, table_groups: 0, profiling_runs: 0});
            } finally {
                setLoading(false);
            }
        };

        loadDashboardInitialData();
    }, []); // Empty dependency array means this runs once on mount


    // --- Handlers ---
    // Handler for DataGrid row click (updates charts and shows detailed results table)
    const handleProfilingRowClick = async (params) => {
         const clickedRunSummary = params.row; // The summary data from the DataGrid row
         setShowResultsTable(false); // Hide previous detailed table while loading

        // Update charts to show data for the clicked run
        setDisplayedRunSummary(clickedRunSummary);
        setDisplayedProfileResults([]); // Clear previous chart data while loading
        setError(''); // Clear previous errors related to chart data

        try {
            // Fetch detailed results for the clicked run
            const detailedResults = await fetchProfileResult(clickedRunSummary.connection_id, clickedRunSummary.profiling_id);
            setDisplayedProfileResults(detailedResults); // Update chart data

            // Also set data for the detailed results table below
            setProfilingResultsDetailed(detailedResults);
            setShowResultsTable(true); // Show the detailed table

        } catch (error) {
            console.error("Failed to fetch detailed profiling result for row click", error);
            // Keep the run summary but clear detailed results and show error for charts
            setDisplayedProfileResults([]);
            setError(`Failed to load detailed data for run ${clickedRunSummary.id}.`);
             // Also clear the detailed table data on error
            setProfilingResultsDetailed(null);
            setShowResultsTable(false);
        }
    };

    // Handler for double click on the main dashboard container (navigates to detailed results)
    const handleDoubleClickMain = () => {
        // Navigate using the currently displayed run's IDs
        if (displayedRunSummary && displayedRunSummary.connection_id && displayedRunSummary.profiling_id) {
            navigate(`/connection/${displayedRunSummary.connection_id}/profileresult/${displayedRunSummary.profiling_id}`);
        } else {
             console.warn("Cannot navigate to detailed results: No run data is currently displayed.");
             // Optionally show a user-friendly message
        }
    };

    // Handlers for New Profiling Run Dialog
    const handleOpenNewRunDialog = () => setIsNewRunDialogOpen(true);
    const handleCloseNewRunDialog = () => setIsNewRunDialogOpen(false);
    const handleNewRunSuccess = () => {
        handleCloseNewRunDialog();
        loadDashboardInitialData(); // Reload all dashboard data after a successful new run
    };

    // Handlers for Connections Dialog
    const handleOpenConnectionDialog = () => setIsConnectionDialogOpen(true);
    const handleCloseConnectionDialog = () => setIsConnectionDialogOpen(false);

     // Handlers for Chart Overview Dialog
    const handleOpenOverviewDialog = (title, content) => {
        setOverviewDialogTitle(title);
        setOverviewDialogContent(content);
        setIsOverviewDialogOpen(true);
    };
    const handleCloseOverviewDialog = () => {
        setIsOverviewDialogOpen(false);
        setOverviewDialogTitle('');
        setOverviewDialogContent(null);
    };

    // Handler for 'View Full History' Button
    const handleViewFullHistory = () => {
        navigate('/profiling-history'); // Navigate to the full history route
    };

    // Handler to toggle history table expansion
    const handleToggleHistoryTable = () => {
        setIsHistoryTableExpanded(prev => !prev);
    };


    // --- Data Transformations for Charts ---
    // These transformations now use displayedRunSummary and displayedProfileResults
    const anomalyData = [
        { name: 'Anomaly Rows', value: displayedRunSummary?.anomaly_ct || 0 },
        { name: 'Anomaly Tables', value: displayedRunSummary?.anomaly_table_ct || 0 },
        { name: 'Anomaly Columns', value: displayedRunSummary?.anomaly_column_ct || 0 },
    ];

    // Calculate DQ Score percentage and determine color
    const dqScorePercentage = displayedRunSummary?.dq_score_profiling !== undefined && displayedRunSummary?.dq_score_profiling !== null
        ? (displayedRunSummary.dq_score_profiling * 100).toFixed(2) // Convert to percentage and format
        : 'N/A';

    const dqScoreColor = (score) => {
        // Use the percentage value (0-100) for color logic
        const percentage = parseFloat(score);
        if (isNaN(percentage)) return theme.palette.text.primary; // Default color if N/A
        if (percentage >= 95) return theme.palette.success.main; // Green for high score
        if (percentage >= 80) return theme.palette.warning.main; // Yellow/Orange for medium score
        return theme.palette.error.main; // Red for low score
    };

    // Data Completeness calculation
    const completenessData = displayedRunSummary?.dq_total_data_points !== undefined && displayedRunSummary?.dq_total_data_points !== null && displayedRunSummary?.dq_total_data_points > 0
        ? [
            {
                name: 'Complete',
                value: displayedRunSummary.dq_total_data_points - (displayedRunSummary.dq_affected_data_points || 0), // Handle potential null/undefined
            },
            {
                name: 'Affected',
                value: displayedRunSummary.dq_affected_data_points || 0, // Handle potential null/undefined
            },
        ]
        : []; // Empty array if total data points is zero or null

    // Column Type Distribution calculation
    const columnTypeData = Object.entries(
        displayedProfileResults.reduce((acc, cur) => {
            // Ensure general_type exists
            if (cur.general_type) {
                acc[cur.general_type] = (acc[cur.general_type] || 0) + 1;
            }
            return acc;
        }, {})
    ).map(([type, count]) => ({ name: type, value: count }));

    // PII Flag Distribution calculation
    const piiFlagData = Object.entries(
        displayedProfileResults.reduce((acc, cur) => {
             // Ensure pii_flag exists, default to 'Unknown' if null/empty
            const flag = cur.pii_flag && cur.pii_flag.trim() !== '' ? cur.pii_flag : 'Unknown';
            acc[flag] = (acc[flag] || 0) + 1;
            return acc;
        }, {})
    ).map(([flag, count]) => ({ name: flag, value: count }));


    // Helper function to calculate percentage safely
    const calculatePercentage = (numerator, denominator) => {
        if (denominator === null || denominator === undefined || denominator === 0) {
            return 0; // Avoid division by zero
        }
        return (numerator / denominator) * 100;
    };

    // Top Null Columns calculation
    const topNullCols = [...displayedProfileResults]
        .filter(p => p.null_value_ct !== null && p.record_ct !== null && p.record_ct > 0) // Filter out invalid data
        .map(p => ({
            name: `${p.table_name}.${p.column_name}`,
            percent: calculatePercentage(p.null_value_ct, p.record_ct),
        }))
        .sort((a, b) => b.percent - a.percent) // Sort descending by percentage
        .slice(0, MAX_TOP); // Take top N

    // Top Cardinality Columns calculation
    const topCardinalityCols = [...displayedProfileResults]
        .filter(p => p.distinct_value_ct !== null && p.value_ct !== null && p.value_ct > 0) // Filter out invalid data
        .map(p => ({
            name: `${p.table_name}.${p.column_name}`,
            percent: calculatePercentage(p.distinct_value_ct, p.value_ct),
        }))
        .sort((a, b) => b.percent - a.percent) // Sort descending by percentage
        .slice(0, MAX_TOP); // Take top N


    // --- Chart Overview Content Generation ---
    // These now use displayedRunSummary and displayedProfileResults
    const generateAnomalyOverview = () => {
        if (!displayedRunSummary) return 'No anomaly data available.';
        return (
            <Box>
                <Typography variant="body1" gutterBottom>Summary of anomalies found in the currently displayed profiling run:</Typography>
                <Typography variant="body2">Total Anomaly Rows: {displayedRunSummary.anomaly_ct || 0}</Typography>
                <Typography variant="body2">Tables Affected: {displayedRunSummary.anomaly_table_ct || 0}</Typography>
                <Typography variant="body2">Columns Affected: {displayedRunSummary.anomaly_column_ct || 0}</Typography>
                 {/* Add more context if needed */}
            </Box>
        );
    };

     const generateCompletenessOverview = () => {
        if (!displayedRunSummary || displayedRunSummary.dq_total_data_points === null || displayedRunSummary.dq_total_data_points === undefined) return 'No completeness data available.';
        const complete = displayedRunSummary.dq_total_data_points - (displayedRunSummary.dq_affected_data_points || 0);
        const affected = displayedRunSummary.dq_affected_data_points || 0;
        const total = displayedRunSummary.dq_total_data_points;

        return (
             <Box>
                <Typography variant="body1" gutterBottom>Data completeness summary based on affected data points:</Typography>
                <Typography variant="body2">Total Data Points: {total}</Typography>
                <Typography variant="body2">Complete Data Points: {complete}</Typography>
                <Typography variant="body2">Affected Data Points: {affected}</Typography>
                <Typography variant="body2">Completeness Percentage: {total > 0 ? ((complete / total) * 100).toFixed(2) : 0}%</Typography>
            </Box>
        );
     };

    const generateColumnTypeOverview = () => {
        if (columnTypeData.length === 0) return 'No column type data available.';
        const totalColumns = displayedProfileResults.length;
        const content = (
            <Box>
                <Typography variant="body1" gutterBottom>Distribution of general column types across the profiled tables:</Typography>
                {columnTypeData.map((item, index) => (
                    <Typography variant="body2" key={index}>{item.name}: {item.value} columns ({totalColumns > 0 ? ((item.value / totalColumns) * 100).toFixed(1) : 0}%)</Typography>
                ))}
                 {/* Add explanation of general types (N, A, D, B, O) if helpful */}
            </Box>
        );
        return content;
    };

     const generatePiiFlagOverview = () => {
        if (piiFlagData.length === 0) return 'No PII flag data available.';
        const totalColumns = displayedProfileResults.length;
        const content = (
            <Box>
                <Typography variant="body1" gutterBottom>Distribution of PII (Personally Identifiable Information) flags across columns:</Typography>
                 {piiFlagData.map((item, index) => (
                    <Typography variant="body2" key={index}>{item.name}: {item.value} columns ({totalColumns > 0 ? ((item.value / totalColumns) * 100).toFixed(1) : 0}%)</Typography>
                ))}
                 {/* Add explanation of PII flag meanings if helpful */}
            </Box>
        );
        return content;
     };

    const generateTopNullColsOverview = () => {
        if (topNullCols.length === 0) return 'No columns with null values found or data is incomplete.';
        const content = (
            <Box>
                <Typography variant="body1" gutterBottom>Top {MAX_TOP} columns with the highest percentage of null values:</Typography>
                {topNullCols.map((col, index) => (
                    <Typography variant="body2" key={index}>{col.name}: {col.percent.toFixed(1)}% nulls</Typography>
                ))}
            </Box>
        );
        return content;
    };

    const generateTopCardinalityColsOverview = () => {
         if (topCardinalityCols.length === 0) return 'No columns with distinct values found or data is incomplete.';
        const content = (
            <Box>
                <Typography variant="body1" gutterBottom>Top {MAX_TOP} columns with the highest cardinality (distinct value percentage):</Typography>
                 {topCardinalityCols.map((col, index) => (
                    <Typography variant="body2" key={index}>{col.name}: {col.percent.toFixed(1)}% distinct</Typography>
                ))}
            </Box>
        );
        return content;
    };


    // --- Rendering ---
    if (loading) {
        return (
            <Box mt={10} display="flex" justifyContent="center">
                <CircularProgress size={60} />
            </Box>
        );
    }

    // Render dashboard only if initial summary data is loaded, even if charts data fails
    const showCharts = displayedRunSummary && displayedProfileResults.length > 0;

    return (
        // Attach double click handler to the main container
        <Box p={4} onDoubleClick={showCharts ? handleDoubleClickMain : undefined} sx={{ cursor: showCharts ? 'pointer' : 'default' }}>
            <Typography variant="h4" gutterBottom>
                Dashboard Overview
            </Typography>

            {/* Optional: Add a caption indicating double-click functionality */}
            {showCharts && (
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                    Double click anywhere on the dashboard to see full detailed results for the currently displayed run ({displayedRunSummary?.id}).
                </Typography>
            )}

             {/* Error message for chart data */}
             {error && (
                 <Box textAlign="center" my={2}>
                    <Typography variant="h6" color="error">{error}</Typography>
                 </Box>
             )}


            {/* Top Summary Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={4}>
                    <DashboardCard
                        title="Connections"
                        value={summary.connections}
                        subtitle="Active"
                        // dummyChartData={dummyChartData} // Remove dummy data if not needed
                        onClick={handleOpenConnectionDialog}
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

            {/* Charts Section - Only render if displayedRunSummary and displayedProfileResults are available */}
            {showCharts ? (
                <Grid container spacing={3} mb={4}>
                     {/* DQ Score */}
                    <Grid item xs={12} sm={6} md={4}>
                        {/* Wrap Paper in Box to attach onClick */}
                         <Box onClick={() => handleOpenOverviewDialog('Data Quality Score Overview', generateCompletenessOverview())} sx={{ cursor: 'pointer', height: '100%' }}> {/* Added height 100% */}
                            <Paper sx={{ p: 3, textAlign: 'center', height: '100%', minHeight: 200 }}> {/* Added minHeight */}
                                <Tooltip title={`Data Quality Score: ${dqScorePercentage}%`}>
                                    <Typography variant="h5" sx={{ color: dqScoreColor(dqScorePercentage), fontWeight: 'bold' }}>
                                        DQ Score: {dqScorePercentage}%
                                    </Typography>
                                </Tooltip>
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    Total Rows: {displayedRunSummary.table_ct || 0} | Total Columns: {displayedRunSummary.column_ct || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Affected Data Points: {displayedRunSummary.dq_affected_data_points || 0} / {displayedRunSummary.dq_total_data_points || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" mt={2} display="block">
                                    Click for overview
                                </Typography>
                            </Paper>
                        </Box>
                    </Grid>

                    {/* Anomaly Summary */}
                    <Grid item xs={12} sm={6} md={4}>
                         {/* Wrap Paper in Box to attach onClick */}
                        <Box onClick={() => handleOpenOverviewDialog('Anomaly Summary Overview', generateAnomalyOverview())} sx={{ cursor: 'pointer', height: '100%' }}> {/* Added height 100% */}
                            <Paper sx={{ p: 2, height: '100%', minHeight: 280 }}> {/* Added minHeight */}
                                <Typography variant="h6" gutterBottom>Anomaly Summary</Typography>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={anomalyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis dataKey="name" stroke={theme.palette.text.primary} />
                                        <YAxis stroke={theme.palette.text.primary} />
                                        <RechartsTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: 'none' }} />
                                        <Bar dataKey="value" fill={theme.palette.primary.main} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                                    Click for overview
                                </Typography>
                            </Paper>
                        </Box>
                    </Grid>

                    {/* Data Completeness */}
                    <Grid item xs={12} sm={6} md={4}>
                         {/* Wrap Paper in Box to attach onClick */}
                        <Box onClick={() => handleOpenOverviewDialog('Data Completeness Overview', generateCompletenessOverview())} sx={{ cursor: 'pointer', height: '100%' }}> {/* Added height 100% */}
                            <Paper sx={{ p: 2, height: '100%', minHeight: 280 }}> {/* Added minHeight */}
                                <Typography variant="h6" gutterBottom>Data Completeness</Typography>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <Pie
                                            data={completenessData}
                                            dataKey="value"
                                            nameKey="name"
                                            outerRadius={70}
                                            label={(entry) => `${entry.name}: ${entry.value}`}
                                        >
                                            {completenessData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: 'none' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                                    Click for overview
                                </Typography>
                            </Paper>
                        </Box>
                    </Grid>

                    {/* Column Type Distribution */}
                    <Grid item xs={12} sm={6}>
                         {/* Wrap Paper in Box to attach onClick */}
                        <Box onClick={() => handleOpenOverviewDialog('Column Type Distribution Overview', generateColumnTypeOverview())} sx={{ cursor: 'pointer', height: '100%' }}> {/* Added height 100% */}
                            <Paper sx={{ p: 2, height: '100%', minHeight: 330 }}> {/* Added minHeight */}
                                <Typography variant="h6" gutterBottom>Column Type Distribution</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <Pie
                                            data={columnTypeData}
                                            dataKey="value"
                                            nameKey="name"
                                            outerRadius={90}
                                            label={(entry) => `${entry.name}: ${entry.value}`}
                                        >
                                            {columnTypeData.map((entry, index) => (
                                                <Cell key={`type-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: 'none' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                                    Click for overview
                                </Typography>
                            </Paper>
                        </Box>
                    </Grid>

                    {/* PII Flag Distribution */}
                    <Grid item xs={12} sm={6}>
                         {/* Wrap Paper in Box to attach onClick */}
                         <Box onClick={() => handleOpenOverviewDialog('PII Flag Distribution Overview', generatePiiFlagOverview())} sx={{ cursor: 'pointer', height: '100%' }}> {/* Added height 100% */}
                            <Paper sx={{ p: 2, height: '100%', minHeight: 330 }}> {/* Added minHeight */}
                                <Typography variant="h6" gutterBottom>PII Flag Distribution</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <Pie
                                            data={piiFlagData}
                                            dataKey="value"
                                            nameKey="name"
                                            outerRadius={90}
                                            label={(entry) => `${entry.name}: ${entry.value}`}
                                        >
                                            {piiFlagData.map((entry, index) => (
                                                <Cell key={`pii-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: 'none' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                                    Click for overview
                                </Typography>
                            </Paper>
                        </Box>
                    </Grid>

                    {/* Top Null Columns */}
                    <Grid item xs={12} md={6}>
                         {/* Wrap Paper in Box to attach onClick */}
                         <Box onClick={() => handleOpenOverviewDialog(`Top ${MAX_TOP} Null Columns Overview`, generateTopNullColsOverview())} sx={{ cursor: 'pointer', height: '100%' }}> {/* Added height 100% */}
                            <Paper sx={{ p: 2, height: '100%', minHeight: 350 }}> {/* Added minHeight */}
                                <Typography variant="h6" gutterBottom>Top {MAX_TOP} Columns by Null %</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    {/* Adjusted XAxis height and interval for better label display */}
                                    <BarChart data={topNullCols} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}> {/* Increased bottom margin for labels */}
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} stroke={theme.palette.text.primary} />
                                        <YAxis stroke={theme.palette.text.primary} label={{ value: 'Null %', angle: -90, position: 'insideLeft', fill: theme.palette.text.primary }} />
                                        <RechartsTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: 'none' }} />
                                        <Bar dataKey="percent" fill={theme.palette.error.main} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                                    Click for overview
                                </Typography>
                            </Paper>
                        </Box>
                    </Grid>

                    {/* Top Cardinality Columns */}
                    <Grid item xs={12} md={6}>
                         {/* Wrap Paper in Box to attach onClick */}
                        <Box onClick={() => handleOpenOverviewDialog(`Top ${MAX_TOP} Cardinality Columns Overview`, generateTopCardinalityColsOverview())} sx={{ cursor: 'pointer', height: '100%' }}> {/* Added height 100% */}
                            <Paper sx={{ p: 2, height: '100%', minHeight: 350 }}> {/* Added minHeight */}
                                <Typography variant="h6" gutterBottom>Top {MAX_TOP} Columns by Cardinality %</Typography>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={topCardinalityCols} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}> {/* Increased bottom margin for labels */}
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} stroke={theme.palette.text.primary} />
                                        <YAxis stroke={theme.palette.text.primary} label={{ value: 'Cardinality %', angle: -90, position: 'insideLeft', fill: theme.palette.text.primary }} />
                                        <RechartsTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: 'none' }} />
                                        <Bar dataKey="percent" fill={theme.palette.info.main} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                                    Click for overview
                                </Typography>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            ) : (
                // Message when no chart data is available for charts
                <Box textAlign="center" my={4}>
                    <Typography variant="h6" color="text.secondary">
                        {error || 'No profiling run data available to display charts. Run a profiling job or select a run from the history below.'}
                    </Typography>
                </Box>
            )}


            {/* Profiling Runs Table Section */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mt: 4 }}> {/* Added margin top */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Profiling Run Records</Typography>
                    <Box>
                         {/* Toggle History Table Button */}
                        <Button
                            variant="outlined"
                            onClick={handleToggleHistoryTable}
                            startIcon={isHistoryTableExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                            sx={{ mr: 1 }} // Add margin to the right
                        >
                            {isHistoryTableExpanded ? 'Hide History' : 'Show History'}
                        </Button>
                         {/* New Run Button */}
                        <Button
                            variant="outlined"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={handleOpenNewRunDialog}
                        >
                            New Run
                        </Button>
                    </Box>
                </Box>

                {/* Collapsible DataGrid for Run History */}
                <Collapse in={isHistoryTableExpanded}>
                    {/* Loading and error handling for this section is covered by the main loading/error state */}
                    {rows.length > 0 ? ( // Only render DataGrid if there are rows
                        <div style={{ height: 500, width: "100%" }}>
                            <DataGrid
                                rows={rows}
                                columns={columns} // columns is now defined outside and available
                                pageSize={10}
                                rowsPerPageOptions={[10]}
                                disableRowSelectionOnClick
                                onRowClick={handleProfilingRowClick} // Use the handler to update charts and show detailed table
                                sx={{ // Add dark mode styles for DataGrid
                                    '& .MuiDataGrid-root': {
                                        border: 'none',
                                    },
                                    '& .MuiDataGrid-cell': {
                                        borderColor: theme.palette.divider,
                                        color: theme.palette.text.primary,
                                    },
                                    '& .MuiDataGrid-columnsContainer': {
                                        borderColor: theme.palette.divider,
                                        bgcolor: '#e0e0e0', // Header background
                                        color: theme.palette.text.primary,
                                    },
                                     '& .MuiDataGrid-columnHeaders': {
                                         bgcolor: theme.palette.background.paper, // Ensure header background is consistent
                                     },
                                    '& .MuiDataGrid-columnHeaderTitle': {
                                        fontWeight: 'bold',
                                    },
                                    '& .MuiDataGrid-row': {
                                        '&:nth-of-type(odd)': {
                                            bgcolor: theme.palette.action.hover, // Subtle striping
                                        },
                                        '&:hover': {
                                            bgcolor: theme.palette.action.selected, // Hover color
                                            cursor: 'pointer',
                                        },
                                    },
                                    '& .MuiDataGrid-footerContainer': {
                                        borderColor: theme.palette.divider,
                                        bgcolor: theme.palette.background.paper, // Footer background
                                        color: theme.palette.text.primary,
                                    },
                                     '& .MuiTablePagination-root': {
                                         color: theme.palette.text.primary, // Pagination text color
                                     },
                                     '& .MuiSvgIcon-root': {
                                         color: theme.palette.action.active, // Pagination icon color
                                     }
                                }}
                            />
                        </div>
                    ) : (
                        // Message when no run history is available
                         <Box textAlign="center" py={5}>
                            <Typography variant="body1" color="text.secondary">No profiling run history available.</Typography>
                         </Box>
                    )}
                </Collapse>


               
            </Paper>

            {/* Detailed Profiling Results Section (appears when a history row is clicked) */}
            {showResultsTable && profilingResultsDetailed && (
                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        Detailed Profiling Results for Run {displayedRunSummary?.id}
                    </Typography>
                    {/* Assuming ProfilingResultsTable component is available and accepts profilingData prop */}
                    <ProfilingResultsTable profilingData={profilingResultsDetailed} />
                </Box>
            )}

            {/* Dialogs */}
            <NewProfilingRunDialog
                open={isNewRunDialogOpen}
                onClose={handleCloseNewRunDialog}
                onRunSuccess={handleNewRunSuccess}
            />
            <ConnectionsDialog
                open={isConnectionDialogOpen}
                onClose={handleCloseConnectionDialog}
            />
             {/* New Chart Overview Dialog */}
            <ChartOverviewDialog
                open={isOverviewDialogOpen}
                onClose={handleCloseOverviewDialog}
                title={overviewDialogTitle}
                content={overviewDialogContent}
            />
        </Box>
    );
};

export default Home;
