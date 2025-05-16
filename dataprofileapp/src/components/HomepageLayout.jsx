import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// Remove axios import as API calls are in dbapi file
// import axios from 'axios';

// Import your API functions from your dbapi file
import { getAllConnections, testConnection, createConnection } from '../api/dbapi'; // <--- Import testConnection and createConnection

// Import your SVG icon files
// Assuming these paths are correct relative to this component file
import postgresIcon from '../assets/postgres.svg';
import mysqlIcon from '../assets/mssql.svg';
import sqliteIcon from '../assets/mssql.svg'; // Note: using mssql.svg for sqlite
import oracleIcon from '../assets/oracle.svg';
import sqlserverIcon from '../assets/mssql.svg'; // Note: using mssql.svg for sqlserver
import mongodbIcon from '../assets/postgres.svg'; // Note: using postgres.svg for mongodb
import snowflakeIcon from '../assets/snowflake.svg';
import redshiftIcon from '../assets/redshift .svg'; // Corrected potential typo in filename
import defaultDatabaseIcon from '../assets/postgres.svg'; // Uncommented as it's used

import {
    CssBaseline,
    Paper,
    Typography,
    Button,
    IconButton,
    // Remove TextField, Grid, Box, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, ListItemIcon
    // as these are now used within the new components
    Grid,
    Box,
    Switch,
    createTheme,
    ThemeProvider,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
// Remove ArrowRightIcon, ExpandMoreIcon, ChevronRightIcon
// as these are now used within the new components

// Import the new components
import AddConnectionForm from './Home componenets/AddConnectionForm'; // Assuming path
import SchemaProfilingControls from './Home componenets/SchemaProfilingControls'; // Assuming path
import DataSourcesTable from './Home componenets/DataSourcesTable'; // Assuming path
import TestCasesList from './Home componenets/TestCasesList'; // Assuming path


const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                primary: { main: '#1976d2' },
                secondary: { main: '#dc004e' },
                background: { default: '#f0f2f5', paper: '#fff' },
                text: { primary: 'rgba(0, 0, 0, 0.87)', secondary: 'rgba(0, 0, 0, 0.6)' },
                status: { connected: '#4caf50', notConnected: '#f44336', saliented: '#ff9800' },
            }
            : {
                primary: { main: '#90caf9' },
                secondary: { main: '#f48fb1' },
                background: { default: '#121212', paper: '#1e1e1e' },
                text: { primary: '#fff', secondary: 'rgba(255, 255, 255, 0.7)' },
                status: { connected: '#81c784', notConnected: '#e57373', saliented: '#ffb74d' },
            }),
    },
});

const useMemoizedTheme = (mode) => useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

const DatabaseTypeImages = {
    "PostgreSQL": postgresIcon,
    "MySQL": mysqlIcon,
    "SQLite": sqliteIcon, // Using mssql.svg as provided
    "Oracle": oracleIcon,
    "SQL Server": sqlserverIcon, // Using mssql.svg as provided
    "MongoDB": mongodbIcon, // Using postgres.svg as provided
    "Snowflake": snowflakeIcon,
    "Redshift": redshiftIcon,
    "default": defaultDatabaseIcon, // Fallback for unknown types (using postgres.svg as provided)
};

// Function to get the image source
const getDatabaseImageSrc = (sqlFlavor) => {
    return DatabaseTypeImages.hasOwnProperty(sqlFlavor) && DatabaseTypeImages[sqlFlavor] ? DatabaseTypeImages[sqlFlavor] : DatabaseTypeImages.default;
};


const HomepageLayout = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState(() => localStorage.getItem('themeMode') === 'light' ? 'light' : 'dark');
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State to control visibility of the Add Connection form
    const [showAddConnectionForm, setShowAddConnectionForm] = useState(false);

    // State for Schema Profiling (example - you'll need more state here)
    const [schemaProfilingData, setSchemaProfilingData] = useState({ connections: [], schemas: [], tables: [] }); // Example structure
    const [testCasesData, setTestCasesData] = useState([]); // Example state for test cases


    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    // Effect to fetch connections on mount
    useEffect(() => {
        const fetchConnections = async () => {
            try {
                setLoading(true);
                const data = await getAllConnections();
                setConnections(data);
                // You might also want to update schemaProfilingData.connections here
                setSchemaProfilingData(prevData => ({ ...prevData, connections: data }));
                setError(null);
            } catch (err) {
                setError(err);
                console.error("Failed to fetch connections:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchConnections();
    }, []); // Empty dependency array means this runs once on mount

    const theme = useMemoizedTheme(mode);

    const handleThemeToggle = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    // Handlers for the Add Connection Form
    const handleAddConnectionClick = () => {
        setShowAddConnectionForm(true);
    };

    const handleCloseAddConnectionForm = () => {
        setShowAddConnectionForm(false);
    };

    const handleCreateConnection = async (formData) => {
        console.log('Attempting to create connection with data:', formData);
        try {
            // Call the createConnection API function
            const newConnection = await createConnection(formData);
            console.log('Connection created successfully:', newConnection);
            // Update the connections list by refetching or adding the new connection
            const updatedConnections = await getAllConnections(); // Refetch all connections
            setConnections(updatedConnections);
            setSchemaProfilingData(prevData => ({ ...prevData, connections: updatedConnections })); // Update connections in schema profiling state
            setShowAddConnectionForm(false); // Close the form on success
            // Optionally show a success message to the user
        } catch (err) {
            console.error('Error creating connection:', err);
            // Handle error (e.g., show an error message to the user)
        }
    };

    const handleTestConnection = async (formData) => {
        console.log('Attempting to test connection with data:', formData);
        try {
            // Call the testConnection API function
            const testResult = await testConnection(formData);
            console.log('Test connection result:', testResult);
            // Show the test result to the user (e.g., in a dialog or alert)
            alert(`Connection Test Result: ${testResult.status === 'success' ? 'Successful' : 'Failed'}\nMessage: ${testResult.message}`);
        } catch (err) {
            console.error('Error testing connection:', err);
            // Handle error (e.g., show an error message)
             alert(`Connection Test Failed: ${err.message}`);
        }
    };

    // Handler for clicking a connection row in the Data Sources table
    const handleConnectionRowClick = (connectionId) => {
        console.log('Connection row clicked, navigating to details:', connectionId);
        // Navigate to the detailed connection view page using the connection_id
        navigate(`/connection/${connectionId}`);
    };

    // Handlers for Schema Profiling Controls
    const handleSchemaProfilingCancel = () => {
        console.log('Schema Profiling Cancel clicked');
        // Implement cancel logic if needed
    };

    const handleSchemaProfilingTest = () => {
        console.log('Schema Profiling Test Connection clicked');
        // Implement test connection logic for profiling if different
    };

    const handleSchemaTableClick = (itemDetails) => {
        console.log('Schema Table item clicked:', itemDetails);
        // Implement logic for expanding or showing details for schema table items
    };

    // Handlers for Test Cases List
     const handleAddTestCase = () => {
         console.log('Add Test Case clicked');
         // Implement logic to add a new test case (e.g., open a modal)
     };

     const handleTestCaseClick = (itemDetails) => {
         console.log('Test Case item clicked:', itemDetails);
         // Implement logic for viewing/editing a test case
     };


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ p: 3, minHeight: '100vh', bgcolor: theme.palette.background.default }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Typography variant="body2" color="text.primary" sx={{ mr: 1 }}>
                        {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </Typography>
                    <Switch
                        checked={mode === 'dark'}
                        onChange={handleThemeToggle}
                        color="primary"
                        inputProps={{ 'aria-label': 'theme toggle switch' }}
                    />
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 3,
                        justifyContent: 'center',
                        maxWidth: 'lg',
                        mx: 'auto',
                    }}
                >
                    {/* Data Sources Card - Use the new component */}
                    <Grid item xs={12} sm={6} md={5} lg={4.5} sx={{ flexGrow: 1, flexBasis: 'min(400px, 100%)' }}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6">Data Sources</Typography>
                                {/* Call the handler to show the form */}
                                <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={handleAddConnectionClick}>
                                    Add Connection
                                </Button>
                            </Box>
                             {/* Render the new DataSourcesTable component */}
                            <DataSourcesTable
                                connections={connections}
                                loading={loading}
                                error={error}
                                getDatabaseImageSrc={getDatabaseImageSrc} // Pass necessary functions/data as props
                                onConnectionClick={handleConnectionRowClick}
                                theme={theme} // Pass theme if needed for styling within the table
                            />
                        </Paper>
                    </Grid>

                    {/* Add Connection Card - Conditionally render the form component */}
                     {showAddConnectionForm && ( // Render the form only when showAddConnectionForm is true
                         <Grid item xs={12} sm={6} md={7} lg={6.5} sx={{ flexGrow: 1, flexBasis: 'min(500px, 100%)' }}>
                             <Paper sx={{ p: 2, position: 'relative', height: '100%' }}>
                                  <IconButton aria-label="close" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={handleCloseAddConnectionForm}>
                                     <CloseIcon />
                                 </IconButton>
                                 {/* The title is now inside AddConnectionForm */}
                                 {/* <Typography variant="h6" mb={2}>Add Connection</Typography> */}
                                 {/* Render the new AddConnectionForm component */}
                                 <AddConnectionForm
                                      onCancel={handleCloseAddConnectionForm} // Pass handlers down
                                      onTestConnection={handleTestConnection}
                                      onCreateConnection={handleCreateConnection}
                                      // Pass other necessary props like database types if needed
                                 />
                             </Paper>
                         </Grid>
                     )}


                    {/* Schema Profiling Card - Use the new component */}
                    <Grid item xs={12} sm={6} md={7} lg={6.5} sx={{ flexGrow: 1, flexBasis: 'min(500px, 100%)' }}>
                        <Paper sx={{ p: 2, position: 'relative', height: '100%' }}>
                             {/* The close icon is still handled here as it controls the card's visibility */}
                             {/* The title is now inside SchemaProfilingControls */}
                             {/* <Typography variant="h6" mb={2}>Schema Profiling</Typography> */}
                             {/* Render the new SchemaProfilingControls component */}
                             <SchemaProfilingControls
                                
                                 onTestConnection={handleSchemaProfilingTest}
                                 onTableItemClick={handleSchemaTableClick}
                                 theme={theme} // Pass theme if needed
                                 connections={schemaProfilingData.connections} // Pass connections data
                                 schemas={schemaProfilingData.schemas} // Pass schemas data
                                 tables={schemaProfilingData.tables} // Pass tables data
                             />
                         </Paper>
                    </Grid>

                    {/* Test Cases Card - Use the new component */}
                    <Grid item xs={12} sm={6} md={5} lg={4.5} sx={{ flexGrow: 1, flexBasis: 'min(400px, 100%)' }}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6">Test Cases</Typography>
                                <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={handleAddTestCase}>
                                    Add Test Case
                                </Button>
                            </Box>
                             {/* Render the new TestCasesList component */}
                             <TestCasesList
                                 testCases={testCasesData} // Pass test case data
                                 onItemClick={handleTestCaseClick} // Pass handlers down
                                 theme={theme} // Pass theme if needed
                             />
                        </Paper>
                    </Grid>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default HomepageLayout;
