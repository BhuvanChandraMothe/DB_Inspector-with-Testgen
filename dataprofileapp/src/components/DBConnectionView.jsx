import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    getConnectionById,
    updateConnection,
    testConnection,
    getTableGroups, // Import getTableGroups
    getConnectionProfiling,
    updateTableGroup,
    deleteTableGroup
} from '../api/dbapi';
import DBConnectionForm from './DBConnectionForm'; // Assuming this component is updated to use the new field names
import { MenuItem, FormControl, InputLabel, Select, CircularProgress } from '@mui/material'; // Added CircularProgress
import AddTableGroupModal from './AddTableGroupModal'; // Import the modal component
import EditIcon from '@mui/icons-material/Edit';
import {
    IconButton,
    Box,
    Typography,
    Button,
    Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
}));

const DBConnectionView = () => {
    // Get the connection_id from the URL parameters
    const { connection_id } = useParams();
    // State to hold the fetched connection data, formatted for the form
    const [connectionData, setConnectionData] = useState(null);
    // State to toggle between view and edit mode
    const [isEditing, setIsEditing] = useState(false);
    // State to hold status messages (success/error)
    const [status, setStatus] = useState({});
    // State to control the visibility of the Add Table Group modal
    const [showTableGroupModal, setShowTableGroupModal] = useState(false);
    // State to hold the list of table groups for this connection
    const [tableGroups, setTableGroups] = useState([]);
    // State to hold the ID of the currently selected table group in the dropdown
    const [selectedGroupId, setSelectedGroupId] = useState('');
    // State to hold the profiling overview data
    const [overviewData, setOverviewData] = useState(null);
    // State to indicate if overview data is being fetched
    const [isFetchingOverview, setIsFetchingOverview] = useState(false);
    // State to indicate if connection data is being fetched initially
    const [isLoadingConnection, setIsLoadingConnection] = useState(true);


    // Function to transform data from the SQLAlchemy model (as returned by API)
    // to the structure expected by the DBConnectionForm component (matching Pydantic ConnectionBase)
    const transformToFormValues = (data) => {
        // Ensure data is not null or undefined before accessing properties
        if (!data) return null;

        return {
            // Mapping SQLAlchemy model fields to Pydantic/Form fields
            project_code: data.project_code || '',
            connection_name: data.connection_name || '', // Matches SQL column name
            connection_description: data.connection_description || '', // Matches SQL column name
            sql_flavor: data.sql_flavor || '', // Matches SQL column name
            project_host: data.project_host || '', // Matches SQL column name
            project_port: data.project_port || '', // Matches SQL column name (VARCHAR in SQL, string in Pydantic/Form)
            project_user: data.project_user || '', // Matches SQL column name
            password: data.project_pw_encrypted || '', // Matches SQL column name
            project_db: data.project_db || '', // Matches SQL column name
        };
    };

    // Effect hook to fetch connection data when the component mounts or connection_id changes
    useEffect(() => {
        const fetchConnection = async () => {
            setIsLoadingConnection(true);
            try {
                // Fetch the connection data using the connection_id
                const data = await getConnectionById(connection_id);
                console.log('Fetched connection data:', data); // Log fetched connection data
                // Transform the fetched data to the format required by the form
                setConnectionData(transformToFormValues(data));
            } catch (err) {
                console.error('Error fetching DB connection:', err);
                // Optionally set an error status for the user
                setStatus({ type: 'error', message: 'Failed to load connection details.' });
            } finally {
                setIsLoadingConnection(false);
            }
        };

        // Only fetch if connection_id is available
        if (connection_id) {
            fetchConnection();
        }
    }, [connection_id]); // Re-run effect if connection_id changes

    // Function to fetch table groups for the current connection
    const fetchTableGroups = async () => {
        // Ensure connection_id is available before attempting to fetch table groups
        if (!connection_id) {
            console.warn("connection_id is not available yet, cannot fetch table groups.");
            setTableGroups([]); // Ensure state is empty if no ID
            return;
        }
        console.log("Attempting to fetch table groups for connection ID:", connection_id); // Log the connection ID being used

        try {
            // Fetch table groups using the connection_id
            const groups = await getTableGroups(connection_id);
            console.log('Fetched table groups response:', groups); // Log the raw API response
            // Check if the response is an array and not empty before setting state
            if (Array.isArray(groups)) {
                console.log('Setting table groups state with:', groups); // Log the data being set to state
                setTableGroups(groups);
            } else {
                console.warn('Unexpected tableGroups response format:', groups);
                setTableGroups([]); // Set to empty array on unexpected response
            }
        } catch (err) {
            console.error('Failed to fetch table groups:', err); // Log the error details
            setTableGroups([]); // Set to empty array on error
        }
    };

    // Effect hook to fetch table groups when the component mounts or connection_id changes
    useEffect(() => {
        if (connection_id) {
            fetchTableGroups();
        }
    }, [connection_id]); // Re-run effect if connection_id changes

    // Call this when you want to delete a table group
    const handleDeleteTableGroup = async (connectionId, groupId) => {
        try {
            await deleteTableGroup(connectionId, groupId);
            console.log("Table group deleted successfully!");
            // Optionally: refresh table group list after deletion
            await fetchTableGroups(connectionId); // assuming you have a function to refresh table groups
        } catch (error) {
            console.error("Failed to delete table group:", error);
        }
    };

    // Call this when you want to update a table group
    const handleUpdateTableGroup = async (connectionId, groupId, updatedData) => {
        try {
            const updatedGroup = await updateTableGroup(connectionId, groupId, updatedData);
            console.log("Table group updated successfully!", updatedGroup);
            // Optionally: refresh table group list after update
            await fetchTableGroups(connectionId);
        } catch (error) {
            console.error("Failed to update table group:", error);
        }
    };


    // Function to fetch profiling overview data for the connection
    const fetchOverview = async () => {
        // Ensure connectionData is available before fetching overview
        if (!connectionData) {
            console.error("Connection data not loaded yet.");
            setStatus({ type: 'error', message: 'Connection data not available to fetch overview.' });
            return;
        }

        setIsFetchingOverview(true);
        setOverviewData(null); // Clear previous overview data
        setStatus({}); // Clear previous status messages

        try {
            // Map form values to the payload structure expected by getConnectionProfiling
            // Note: This payload structure seems to align with ConnectionProfilingRequest Pydantic model
            const profilingPayload = {
                db_type: connectionData.sql_flavor, // Map from form field name
                db_hostname: connectionData.project_host, // Map from form field name
                db_port: parseInt(connectionData.project_port, 10), // Map from form field (str) and convert to int
                user: connectionData.project_user, // Map from form field name
                password: connectionData.password, // Password input from form (be cautious with sending raw password)
                database: connectionData.project_db, // Map from form field name
                project_code: connectionData.project_code, // Map from form field name
            };

            console.log("conn_id being sent:", connection_id);
            console.log("payload being sent for profiling:", profilingPayload);

            // Call the API function to get profiling data, passing connection_id and payload
            const overview = await getConnectionProfiling(connection_id, profilingPayload); // Assuming API expects ID in URL and payload in body

            setOverviewData(overview); // Set the fetched overview data
            setStatus({ type: 'success', message: 'Profiling data fetched successfully.' });
        } catch (error) {
            console.error("Error fetching profiling data:", error);
            // Attempt to get a more specific error message from the backend response
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch profiling data.';
            setOverviewData({ status: "failed", message: errorMessage }); // Store error in overviewData as well
            setStatus({ type: 'error', message: errorMessage }); // Set error status message
        } finally {
            setIsFetchingOverview(false); // Set loading state to false
        }
    };


    // Function to handle updating the connection
    const handleUpdate = async (values) => {
        setStatus({}); // Clear previous status messages
        try {
            // Map form values (matching Pydantic ConnectionBase) to DBConnectionUpdate Pydantic model structure
            const updatePayload = {
                project_code: values.project_code,
                connection_name: values.connection_name,
                connection_description: values.connection_description,
                sql_flavor: values.sql_flavor,
                project_host: values.project_host,
                project_port: values.project_port, // Keep as string for Pydantic/SQL
                project_user: values.project_user,
                // Only include password in update payload if it was changed in the form
                // You might need logic in DBConnectionForm to track if password field was modified
                // For simplicity here, sending if it's not empty string (though this might overwrite if user clears it)
                password: values.password,
                project_db: values.project_db,
            };

            // Call the API function to update the connection, passing connection_id and payload
            await updateConnection(connection_id, updatePayload);

            setStatus({ type: 'success', message: 'Connection updated successfully' });
            setIsEditing(false); // Exit edit mode
            // Optionally refetch connection data to ensure UI is fully updated with DB state
            setConnectionData(transformToFormValues({ ...connectionData, ...values })); // Merge updated values
        } catch (err) {
            console.error('Failed to update connection:', err);
            // Attempt to get a more specific error message from the backend response
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to update connection.';
            setStatus({ type: 'error', message: errorMessage });
        }
    };

    // Function to handle testing the connection
    const handleTest = async (currentFormValues) => {
        setStatus({}); // Clear previous status messages
        // Ensure currentFormValues is available
        if (!currentFormValues) {
            console.error("Form values not available for testing.");
            setStatus({ type: 'error', message: 'Form data not available to test connection.' });
            return;
        }

        try {
            // Map form values (matching Pydantic ConnectionBase) to TestConnectionRequest Pydantic model structure
            const testPayload = {
                sql_flavor: currentFormValues.sql_flavor, // Map from form field name
                db_hostname: currentFormValues.project_host, // Map from form field name
                db_port: parseInt(currentFormValues.project_port, 10), // Map from form field (str) and convert to int
                user_id: currentFormValues.project_user, // Map from form field name
                password: currentFormValues.password, // Password input from form
                database: currentFormValues.project_db, // Map from form field name
            };

            // Call the API function to test the connection
            const result = await testConnection(testPayload);

            if (result.status) {
                setStatus({ type: 'success', message: result.message || 'Connection is valid' });
            } else {
                setStatus({ type: 'error', message: result.message || 'Connection test failed' });
            }
        } catch (err) {
            console.error('Connection test failed:', err);
            // Attempt to get a more specific error message from the backend response
            const errorMessage = err.response?.data?.detail || err.message || 'Connection test failed.';
            setStatus({ type: 'error', message: errorMessage });
        }
    };

    // Show loading indicator while fetching initial connection data
    if (isLoadingConnection) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress color="primary" />
                <Typography variant="h6" color="white" ml={2}>Loading Connection...</Typography>
            </Box>
        );
    }

    // Show error if connection data failed to load
    if (!connectionData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography color="error">Failed to load connection details.</Typography>
            </Box>
        );
    }

    return (
        // The main container for the view
        <Box display="flex" sx={{ width: '100%', height: 'calc(100vh - 64px)', overflow: 'auto' }}>
            {/* Left panel for Connection Details and Form */}
            <Box flexGrow={1} sx={{ overflow: 'auto', p: 2, mr: 2, maxWidth: '70%' }}>
                {/* Header for Connection Details/Edit */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" color="white">
                        {isEditing ? 'Edit Connection' : 'Connection Details'}
                    </Typography>
                    {/* Edit/View Toggle Button */}
                    <IconButton onClick={() => setIsEditing((prev) => !prev)} color="primary">
                        <EditIcon sx={{ color: '#fff' }} />
                    </IconButton>
                </Box>

                {/* Paper container for the form or details */}
                <StyledPaper sx={{ mb: 2, backgroundColor: '#1e1e1e', color: '#fff' }}>
                    {/* Render the DBConnectionForm component */}
                    {/* Pass initialValues, onSubmit (handleUpdate), onTestConnection (handleTest), isEditing state, and status */}
                    <DBConnectionForm
                        initialValues={connectionData} // Pass the fetched and transformed connection data
                        onSubmit={handleUpdate} // Pass the update handler
                        onTestConnection={handleTest} // Pass the test handler
                        isEditing={isEditing} // Pass the editing state
                        status={status} // Pass the status messages
                    />

                    {/* Buttons shown only in view mode */}
                    {!isEditing && (
                        <Box mt={2} display="flex" gap={2} flexWrap="wrap"> {/* Added flexWrap */}
                            {/* Test Connection Button */}
                            <Button variant="outlined" color="primary" onClick={() => handleTest(connectionData)}> {/* Pass current connectionData for test */}
                                Test Connection
                            </Button>
                            {/* Get Profiling Button */}
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={fetchOverview} // Call fetchOverview when clicked
                                disabled={isFetchingOverview} // Disable while fetching
                                startIcon={isFetchingOverview ? <CircularProgress size={20} color="inherit" /> : null} // Loading icon
                            >
                                {isFetchingOverview ? 'Fetching Profiling...' : 'Get Profiling of Database'}
                            </Button>
                            {/* Add Table Group Button */}
                            <Button
                                variant="outlined"
                                color="success"
                                onClick={() => setShowTableGroupModal(true)} // Open the modal
                            >
                                + Add Table Group
                            </Button>
                        </Box>
                    )}

                    {/* Add Table Group Modal */}
                    <AddTableGroupModal
                        open={showTableGroupModal}
                        onClose={() => {
                            setShowTableGroupModal(false);
                            fetchTableGroups(); // Refresh the table groups list after the modal closes
                        }}
                        connectionId={connection_id} // Pass the current connection ID to the modal
                    />

                    {/* Display Status Messages */}
                    {/* {status.message && (
                        <Box
                            mt={2}
                            p={2}
                            bgcolor={status.type === 'success' ? 'success.dark' : 'error.dark'} // Use theme colors
                            color="white"
                            borderRadius={1}
                        >
                            <Typography>{status.message}</Typography>
                        </Box>
                    )} */}

                    {/* Display Overview Data */}
                    {/* {overviewData && (
                        <Box mt={3} bgcolor="#1e1e1e" p={2} borderRadius={1}>
                            <Typography variant="h6" color="white" mb={1}>Database Overview:</Typography>
                            {overviewData.status === 'failed' ? (
                                <Typography color="error">{overviewData.message}</Typography>
                            ) : (
                                <pre style={{ color: 'white', overflowX: 'auto' }}>
                                    {JSON.stringify(overviewData, null, 2)}
                                </pre>
                            )}
                        </Box>
                    )} */}

                </StyledPaper>
            </Box>

            {/* Right panel for Table Groups */}
            <Box sx={{ width: '30%', p: 2 }}>
                <StyledPaper sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
                    <Typography variant="h7" gutterBottom>
                        Select Table Group
                    </Typography>

                    {/* Table Group Select Dropdown */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="table-group-label">Select Table Group</InputLabel>
                        <Select
                            labelId="table-group-label"
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            renderValue={(selected) => {
                                const group = tableGroups.find(g => g.group_id === selected);
                                return group ? group.group_name : '';
                            }}
                        >
                            {tableGroups.map((group) => (
                                <MenuItem key={group.group_id} value={group.group_id}>
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        width="100%"
                                    >
                                        <Typography>{group.group_name}</Typography>

                                        <Box display="flex" alignItems="center">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditTableGroup(group);
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>

                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTableGroup(group.group_id);
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>


                    {/* Button to run with the selected table group */}
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!selectedGroupId} // Disable if no group is selected
                        onClick={() => {
                            // Find the selected group object from the tableGroups array
                            const selectedGroup = tableGroups.find((group) => group.id === selectedGroupId);
                            // Prepare payload (adjust structure as needed for your future API call)
                            const payload = {
                                connectionId: connection_id,
                                connectionParams: connectionData, // Current connection details
                                tableGroupParams: selectedGroup, // Selected table group details
                            };
                            console.log('Data when selected the particular tablegroup (payload for future API):', payload);
                            // TODO: Call your API function here in the future to run profiling/tests with the selected group
                        }}
                    >
                        Run with Selected Group
                    </Button>
                </StyledPaper>
            </Box>
        </Box>
    );
};

export default DBConnectionView;
