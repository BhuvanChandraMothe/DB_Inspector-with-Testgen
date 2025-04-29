import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    getConnectionById,
    updateConnection,
    testConnection,
    getTableGroups,
    getConnectionProfiling,
    updateTableGroup,
    deleteTableGroup,
    triggerProfiling // Correctly importing triggerProfiling from dbapi
} from '../api/dbapi';
import DBConnectionForm from './DBConnectionForm';
import {
    MenuItem, FormControl, InputLabel, Select, CircularProgress,
    IconButton, Box, Typography, Button, Paper,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// Import your modal components
import AddTableGroupModal from './AddTableGroupModal';
import EditTableGroupModal from './EditTableGroupModal';


// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
}));

const StyledFormControl = styled(FormControl)({
    width: '100%',
    marginBottom: '1.5rem',
});

// Styles for the dropdown appearance (retaining previous syntax fixes)
const StyledSelect = styled(Select)(({ theme }) => ({
    '.MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.divider,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.light,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
    },
    '.MuiSelect-select': {
        color: theme.palette.text.primary,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: '32px !important',
    },
    '.MuiSvgIcon-root': {
        color: theme.palette.text.secondary,
    },
    '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.action.disabledBackground,
    },
    '&.Mui-disabled .MuiSelect-select': {
        color: theme.palette.action.disabled,
    },
    '&.Mui-disabled .MuiSvgIcon-root': {
        color: theme.palette.action.disabled,
    },
}));

// Style for MenuItem content to ensure spacing between text and icons
const StyledMenuItemContent = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
});


const DBConnectionView = () => {
    const { connection_id } = useParams();

    // State for Connection Details
    const [connectionData, setConnectionData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState({});
    const [isLoadingConnection, setIsLoadingConnection] = useState(true);

    // State for Table Groups List (for the dropdown)
    const [tableGroups, setTableGroups] = useState([]);
    // State to hold the ID of the currently selected table group in the dropdown (for "Run" button logic)
    const [selectedGroupId, setSelectedGroupId] = useState('');

    // State for Profiling Overview
    const [overviewData, setOverviewData] = useState(null);
    const [isFetchingOverview, setIsFetchingOverview] = useState(false);

    // State for Table Group Modals
    const [showAddTableGroupModal, setShowAddTableGroupModal] = useState(false);
    const [showEditTableGroupModal, setShowEditTableGroupModal] = useState(false);
    const [tableGroupToEdit, setTableGroupToEdit] = useState(null); // Holds data for the group being edited

    // State for Delete Confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [groupToDeleteId, setGroupToDeleteId] = useState(null); // Holds ID for the group being deleted
    const [groupToDeleteName, setGroupToDeleteName] = useState(''); // Holds name for the group being deleted (for dialog text)


    // Loading states for async operations (used for disabling buttons)
    const [isSavingTableGroup, setIsSavingTableGroup] = useState(false);
    const [isDeletingTableGroup, setIsDeletingTableGroup] = useState(false);
    const [isTriggeringProfiling, setIsTriggeringProfiling] = useState(false); // Loading for Run Profiling


    // Function to transform data from the SQLAlchemy model for the form
    const transformToFormValues = (data) => {
        if (!data) return null;
        return {
            id: data.id,
            connection_id: data.connection_id,
            project_code: data.project_code || '',
            connection_name: data.connection_name || '',
            connection_description: data.connection_description || '',
            sql_flavor: data.sql_flavor || '',
            project_host: data.project_host || '',
            project_port: data.project_port || '',
            project_user: data.project_user || '',
            password: data.decrypted_password || '', // Use the decrypted_password field from the backend response
            project_db: data.project_db || '',
            // Include other fields if they are part of your form and Pydantic model
            // max_threads: data.max_threads,
            // max_query_chars: data.max_query_chars,
            // url: data.url || '',
            // connect_by_url: data.connect_by_url || false,
            // connect_by_key: data.connect_by_key || false,
            // http_path: data.http_path || '',
        };
    };

    // Fetch connection data initially
    const fetchConnection = async () => {
        setIsLoadingConnection(true);
        setStatus({}); // Clear previous status for this action
        try {
            const data = await getConnectionById(connection_id);
            console.log('Fetched connection data:', data);
            setConnectionData(transformToFormValues(data));
        } catch (err) {
            console.error('Error fetching DB connection:', err);
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to load connection details.';
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsLoadingConnection(false);
        }
    };

    // Effect hook to fetch connection data on mount or ID change
    useEffect(() => {
        if (connection_id) {
            fetchConnection();
        }
    }, [connection_id]);

    // Function to fetch the list of table groups
    const fetchTableGroupsList = async () => {
        if (!connection_id) {
            console.warn("connection_id is not available yet, cannot fetch table groups list.");
            setTableGroups([]);
            return;
        }
        console.log("Attempting to fetch table groups list for connection ID:", connection_id);

        try {
            const groups = await getTableGroups(connection_id);
            console.log('Fetched table groups list response:', groups);
            if (Array.isArray(groups)) {
                setTableGroups(groups);
                // Optional: If the previously selected group still exists, keep it selected
                if (selectedGroupId && !groups.some(group => group.group_id === selectedGroupId)) {
                    setSelectedGroupId(''); // Clear selection if selected group was deleted or no longer in list
                }
            } else {
                console.warn('Unexpected tableGroups list response format:', groups);
                setTableGroups([]);
            }
        } catch (err) {
            console.error('Failed to fetch table groups list:', err);
            setTableGroups([]);
            // Consider setting status for the user
            setStatus({ type: 'error', message: 'Failed to load table groups.' });
        }
    };

    // Effect hook to fetch table groups when the component mounts or connection_id changes
    useEffect(() => {
        if (connection_id) {
            fetchTableGroupsList();
        }
    }, [connection_id]); // Depend on connection_id

    // Function to handle updating the connection
    const handleUpdate = async (values) => {
        setStatus({}); // Clear previous status for this action
        try {
            const updatePayload = {
                project_code: values.project_code,
                connection_name: values.connection_name,
                connection_description: values.connection_description,
                sql_flavor: values.sql_flavor,
                project_host: values.project_host,
                project_port: values.project_port,
                project_user: values.project_user,
                password: values.password,
                project_db: values.project_db,
            };
            await updateConnection(connection_id, updatePayload);
            setStatus({ type: 'success', message: 'Connection updated successfully' });
            setIsEditing(false);
            // Update local state with potentially new password (if changed) and other fields
            setConnectionData(transformToFormValues({ ...connectionData, ...values }));

        } catch (err) {
            console.error('Failed to update connection:', err);
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to update connection.';
            setStatus({ type: 'error', message: errorMessage });
        }
    };

    // Function to handle testing the connection
    const handleTest = async (currentFormValues) => {
        setStatus({}); // Clear previous status for this action
        if (!currentFormValues) {
            console.error("Form values not available for testing.");
            setStatus({ type: 'error', message: 'Form data not available to test connection.' });
            return;
        }
        try {
            const testPayload = {
                sql_flavor: currentFormValues.sql_flavor,
                db_hostname: currentFormValues.project_host,
                db_port: parseInt(currentFormValues.project_port, 10),
                user_id: currentFormValues.project_user, // Ensure this matches backend API expecting user_id
                password: currentFormValues.password,
                database: currentFormValues.project_db,
            };

            const result = await testConnection(testPayload);

            if (result.status) {
                setStatus({ type: 'success', message: result.message || 'Connection is valid' });
            } else {
                setStatus({ type: 'error', message: result.message || 'Connection test failed' });
            }
        } catch (err) {
            console.error('Connection test failed:', err);
            const errorMessage = err.response?.data?.detail || err.message || 'Connection test failed.';
            setStatus({ type: 'error', message: errorMessage });
        }
    };

    // Function to fetch profiling overview data for the connection
    const fetchOverview = async () => {
        if (!connectionData) {
            console.error("Connection data not loaded yet.");
            setStatus({ type: 'error', message: 'Connection data not available to fetch overview.' });
            return;
        }

        setIsFetchingOverview(true);
        setOverviewData(null);
        setStatus({}); // Clear previous status for this action

        try {
            // Build the payload from current connectionData state
            const profilingPayload = {
                db_type: connectionData.sql_flavor,
                db_hostname: connectionData.project_host,
                db_port: parseInt(connectionData.project_port, 10),
                user: connectionData.project_user, // Ensure this matches backend API expecting 'user'
                password: connectionData.password,
                database: connectionData.project_db,
                project_code: connectionData.project_code,
            };

            const overview = await getConnectionProfiling(connection_id, profilingPayload);

            setOverviewData(overview);
            setStatus({ type: 'success', message: 'Database overview fetched successfully.' });
        } catch (error) {
            console.error("Error fetching database overview:", error);
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch database overview.';
            setOverviewData({ status: "failed", message: errorMessage }); // Set status within overview data as well
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsFetchingOverview(false);
        }
    };


    // --- Table Group Actions ---

    // Handle opening the Add Table Group modal
    const handleOpenAddTableGroupModal = () => {
        setStatus({}); // Clear previous status for this action
        setShowAddTableGroupModal(true);
    };

    // Handle closing the Add Table Group modal and refreshing the list
    const handleCloseAddTableGroupModal = () => {
        setShowAddTableGroupModal(false);
        // Refresh the list after add modal closes to show the new group
        fetchTableGroupsList();
    };

    // Prepare to delete a table group (show confirmation dialog)
    // This is called when the Delete icon in the MenuItem is clicked
    const confirmDeleteTableGroup = (groupId, groupName) => {
        console.log("Attempting to confirm delete for group ID:", groupId);
        if (!groupId) {
            console.error("Cannot confirm delete, received invalid group ID:", groupId);
            setStatus({ type: 'error', message: 'Cannot delete: invalid group selected.' });
            return;
        }
        setGroupToDeleteId(groupId);
        setGroupToDeleteName(groupName); // Store name for dialog
        setShowDeleteConfirm(true);
    };

    // Execute deletion after confirmation
    // This is called when the "Delete" button in the confirmation dialog is clicked
    const handleDeleteTableGroup = async () => {
        // Close confirmation modal immediately upon click
        setShowDeleteConfirm(false);

        if (!connection_id || !groupToDeleteId) {
            console.error("Missing connection ID or group ID during deletion execution.");
            setStatus({ type: 'error', message: 'Cannot delete table group: missing information.' });
            setGroupToDeleteId(null);
            setGroupToDeleteName('');
            return;
        }

        setIsDeletingTableGroup(true); // Start loading
        setStatus({}); // Clear previous status for this action

        try {
            console.log(`Attempting to delete table group ID: ${groupToDeleteId} for connection ID: ${connection_id}`);
            // Call the delete API function from dbapi
            await deleteTableGroup(connection_id, groupToDeleteId);
            console.log("Table group deleted successfully!");
            setStatus({ type: 'success', message: `Table group "${groupToDeleteName}" deleted successfully.` });

            // After deletion, refresh the list
            await fetchTableGroupsList();

        } catch (error) {
            console.error("Failed to delete table group:", error);
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete table group.';
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsDeletingTableGroup(false); // Stop loading
            setGroupToDeleteId(null); // Clear the ID being deleted regardless of success/error
            setGroupToDeleteName(''); // Clear the name
        }
    };

    // Cancel deletion
    const cancelDelete = () => {
        setGroupToDeleteId(null);
        setGroupToDeleteName('');
        setShowDeleteConfirm(false);
    };

    // Handle clicking the Edit icon in the MenuItem
    const handleOpenEditTableGroupModal = (group) => {
        console.log("Opening edit modal for group:", group);
        if (!group || !group.group_id) {
            console.error("Cannot edit, invalid group data:", group);
            setStatus({ type: 'error', message: 'Cannot edit: invalid group data.' });
            return;
        }
        setStatus({}); // Clear previous status for this action
        setTableGroupToEdit(group); // Set the group data to be edited
        setShowEditTableGroupModal(true); // Open the edit modal
    };

    // Handle closing the Edit Table Group modal
    const handleCloseEditTableGroupModal = () => {
        setShowEditTableGroupModal(false);
        setTableGroupToEdit(null); // Clear the data being edited
        // List refresh happens after save (handled in handleSaveEditedTableGroup)
    };

    // Handle saving the edited table group (called by the Edit Modal's onSave prop)
    const handleSaveEditedTableGroup = async (updatedData) => {
        // This function is called BY the EditTableGroupModal's save button
        // It receives the updated data from the modal's form
        // The modal should have handled mapping form values to the correct payload structure

        if (!connection_id || !tableGroupToEdit?.group_id) {
            console.error("Missing connection ID or group ID for update (from modal save handler).");
            setStatus({ type: 'error', message: 'Cannot update table group: missing information.' });
            handleCloseEditTableGroupModal(); // Close modal on error
            return;
        }

        setIsSavingTableGroup(true); // Start loading
        setStatus({}); // Clear previous status for this action

        try {
            // Call the update API function from dbapi
            await updateTableGroup(connection_id, tableGroupToEdit.group_id, updatedData);
            console.log("Table group updated successfully!");
            setStatus({ type: 'success', message: 'Table group updated successfully.' });

            // After successful update, refresh the list
            await fetchTableGroupsList();

            // Close the modal
            handleCloseEditTableGroupModal();

        } catch (error) {
            console.error("Failed to update table group:", error);
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to update table group.';
            setStatus({ type: 'error', message: errorMessage });
            // Optionally keep the modal open on error? For this UI, maybe close and show status on main view.
            handleCloseEditTableGroupModal();
        } finally {
            setIsSavingTableGroup(false); // Stop loading
        }
    };

    // Function to trigger profiling for the selected table group
    const handleRunProfiling = async () => {
        if (!connection_id || !selectedGroupId) {
            console.error("Cannot run profiling: missing connection ID or selected table group ID.");
            setStatus({ type: 'error', message: 'Please select a table group to run profiling.' });
            return;
        }

        setIsTriggeringProfiling(true);
        setStatus({}); // Clear previous status for this action

        try {
            // Call the triggerProfiling API function from dbapi
            await triggerProfiling(connection_id, selectedGroupId);

            console.log(`Profiling job triggered successfully for group ID: ${selectedGroupId}`);
            setStatus({ type: 'success', message: `Profiling triggered for group ID: ${selectedGroupId}` });

        } catch (error) {
            console.error("Error triggering profiling:", error);
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to trigger profiling.';
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsTriggeringProfiling(false);
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
                    <DBConnectionForm
                        initialValues={connectionData}
                        onSubmit={handleUpdate}
                        onTestConnection={handleTest}
                        isEditing={isEditing}
                        status={status}
                    />

                    {/* Buttons shown only in view mode */}
                    {!isEditing && (
                        <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                            <Button variant="outlined" color="primary" onClick={() => handleTest(connectionData)}>
                                Test Connection
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={fetchOverview}
                                disabled={isFetchingOverview}
                                startIcon={isFetchingOverview ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {isFetchingOverview ? 'Fetching Profiling...' : 'Get Profiling of Database'}
                            </Button>
                        </Box>
                    )}

                    {/* Display Status Messages */}
                    {status.message && (
                        <Box
                            mt={2}
                            p={2}
                            bgcolor={status.type === 'success' ? 'success.dark' : status.type === 'info' || status.type === 'warning' ? 'primary.dark' : 'error.dark'}
                            color="white"
                            borderRadius={1}
                        >
                            <Typography>{status.message}</Typography>
                        </Box>
                    )}

                    {/* Display Overview Data */}
                    {overviewData && (
                        <Box mt={3} bgcolor="#1e1e1e" p={2} borderRadius={1}>
                            <Typography variant="h6" color="white" mb={1}>Database Overview:</Typography>
                            {overviewData.status === 'failed' ? (
                                <Typography color="error">{overviewData.message}</Typography>
                            ) : (
                                <pre style={{ color: 'white', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {JSON.stringify(overviewData, null, 2)}
                                </pre>
                            )}
                        </Box>
                    )}

                </StyledPaper>
            </Box>

            {/* Right panel for Table Groups and Run Profiling */}
            <Box sx={{ width: '30%', p: 2 }}>
                <StyledPaper sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
                    <Typography variant="h7" gutterBottom>
                        Table Groups
                    </Typography>

                    {/* Add Table Group Button */}
                    <Button
                        variant="outlined"
                        color="success"
                        onClick={handleOpenAddTableGroupModal}
                        sx={{ mb: 2 }}
                    >
                        + Add Table Group
                    </Button>

                    {/* Table Group Select Dropdown */}
                    <StyledFormControl fullWidth margin="normal" variant="outlined">
                        <InputLabel id="table-group-label">Select Table Group</InputLabel>
                        <StyledSelect
                            labelId="table-group-label"
                            id="table-group-select"
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)} // Standard change for selection
                            label="Select Table Group"
                            renderValue={(selected) => {
                                // Find the selected group by its ID to display the name
                                const group = tableGroups.find(g => g.group_id === selected);
                                // Display table_group_name, or empty string if not found
                                return group ? group.table_group_name : '';
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        bgcolor: '#333',
                                        color: '#fff',
                                    },
                                },
                            }}
                        >
                            {/* Add a default/placeholder item */}
                            <MenuItem value="" disabled>
                                <em>None</em>
                            </MenuItem>
                            {tableGroups.map((group) => (
                                <MenuItem key={group.group_id} value={group.group_id}>
                                    <StyledMenuItemContent>
                                        <Typography>{group.table_group_name}</Typography>

                                        <Box display="flex" alignItems="center">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenEditTableGroupModal(group);
                                                }}
                                                aria-label={`edit ${group.table_group_name}`}
                                                sx={{ color: 'inherit', p: 0.5 }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>

                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    confirmDeleteTableGroup(group.group_id, group.table_group_name);
                                                }}
                                                aria-label={`delete ${group.table_group_name}`}
                                                sx={{ color: 'inherit', p: 0.5 }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </StyledMenuItemContent>
                                </MenuItem>
                            ))}
                        </StyledSelect>
                    </StyledFormControl>


                    {/* Button to run with the selected table group */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleRunProfiling} // Call the dedicated handler
                        disabled={!selectedGroupId || isTriggeringProfiling} // Disable if no group is selected or triggering
                        startIcon={isTriggeringProfiling ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />} // Show loading icon
                        sx={{ mt: 2 }}
                    >
                        {isTriggeringProfiling ? 'Triggering...' : 'Run Profiling'}
                    </Button>

                    {/* Display Status Messages (related to Table Groups and Profiling) */}
                    {status.message && (status.type === 'info' || status.type === 'warning' || status.type === 'error' || status.type === 'success') && (
                        <Box
                            mt={2}
                            p={2}
                            bgcolor={status.type === 'success' ? 'success.dark' : status.type === 'info' || status.type === 'warning' ? 'primary.dark' : 'error.dark'}
                            color="white"
                            borderRadius={1}
                        >
                            <Typography>{status.message}</Typography>
                        </Box>
                    )}


                </StyledPaper>
            </Box>

            {/* Add Table Group Modal */}
            <AddTableGroupModal
                open={showAddTableGroupModal}
                onClose={handleCloseAddTableGroupModal} // Handler to close and refresh list
                connectionId={connection_id}
            />

            {/* Edit Table Group Modal */}
            {/* Render conditionally only when a group is selected for editing */}
            {tableGroupToEdit && (
                <EditTableGroupModal
                    open={showEditTableGroupModal}
                    onClose={handleCloseEditTableGroupModal} // Handler to close modal
                    onSave={handleSaveEditedTableGroup} // Handler for saving changes (calls API and refreshes list)
                    connectionId={connection_id}
                    initialData={tableGroupToEdit} // Pass the data of the group to edit
                    isSaving={isSavingTableGroup}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={showDeleteConfirm}
                onClose={cancelDelete}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">{"Confirm Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete the table group
                        <strong>{groupToDeleteName ? ` "${groupToDeleteName}"` : ''}</strong>?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete} color="primary" disabled={isDeletingTableGroup}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteTableGroup} color="error" autoFocus disabled={isDeletingTableGroup}>
                        {isDeletingTableGroup ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default DBConnectionView;
