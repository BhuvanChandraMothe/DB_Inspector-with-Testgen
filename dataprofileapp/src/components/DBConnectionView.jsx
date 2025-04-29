import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    getConnectionById,
    updateConnection,
    testConnection,
    getTableGroups, // Import getTableGroups
    getConnectionProfiling,
    updateTableGroup, // Keep import for calling from modal
    deleteTableGroup // Keep import for calling from handler
} from '../api/dbapi';
import DBConnectionForm from './DBConnectionForm';
import {
    MenuItem, FormControl, InputLabel, Select, CircularProgress,
    IconButton, Box, Typography, Button, Paper,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions // Import Dialog components for confirmation
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';

// Import your modal components
import AddTableGroupModal from './AddTableGroupModal';
// You need to ensure this component exists and is implemented correctly
// (as provided in the previous good response for EditTableGroupModal)
import EditTableGroupModal from './EditTableGroupModal';


const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
}));

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

    // Loading states for async operations (used for disabling buttons)
    const [isSavingTableGroup, setIsSavingTableGroup] = useState(false);
    const [isDeletingTableGroup, setIsDeletingTableGroup] = useState(false);


    // Function to transform data from the SQLAlchemy model (same as before)
    const transformToFormValues = (data) => {
        if (!data) return null;
        return {
            project_code: data.project_code || '',
            connection_name: data.connection_name || '',
            connection_description: data.connection_description || '',
            sql_flavor: data.sql_flavor || '',
            project_host: data.project_host || '',
            project_port: data.project_port || '',
            project_user: data.project_user || '',
            password: data.project_pw_encrypted || '',
            project_db: data.project_db || '',
        };
    };

    // Fetch connection data initially (same as before)
    useEffect(() => {
        const fetchConnection = async () => {
            setIsLoadingConnection(true);
            try {
                const data = await getConnectionById(connection_id);
                console.log('Fetched connection data:', data);
                setConnectionData(transformToFormValues(data));
            } catch (err) {
                console.error('Error fetching DB connection:', err);
                setStatus({ type: 'error', message: 'Failed to load connection details.' });
            } finally {
                setIsLoadingConnection(false);
            }
        };

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
                     setSelectedGroupId(''); // Clear selection if selected group was deleted
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

    // Function to handle updating the connection (same as before)
    const handleUpdate = async (values) => {
        setStatus({});
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
            setConnectionData(transformToFormValues({ ...connectionData, ...values }));
        } catch (err) {
            console.error('Failed to update connection:', err);
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to update connection.';
            setStatus({ type: 'error', message: errorMessage });
        }
    };

    // Function to handle testing the connection (same as before)
    const handleTest = async (currentFormValues) => {
        setStatus({});
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
                 user_id: currentFormValues.project_user, // Check if backend expects user_id or just 'user'
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

    // Function to fetch profiling overview data for the connection (same as before)
     const fetchOverview = async () => {
          if (!connectionData) {
              console.error("Connection data not loaded yet.");
              setStatus({ type: 'error', message: 'Connection data not available to fetch overview.' });
              return;
          }

          setIsFetchingOverview(true);
          setOverviewData(null);
          setStatus({});

          try {
              const profilingPayload = {
                  db_type: connectionData.sql_flavor,
                  db_hostname: connectionData.project_host,
                  db_port: parseInt(connectionData.project_port, 10),
                  user: connectionData.project_user, // Check if backend expects 'user' or 'user_id' here too
                  password: connectionData.password,
                  database: connectionData.project_db,
                  project_code: connectionData.project_code,
              };

              const overview = await getConnectionProfiling(connection_id, profilingPayload);

              setOverviewData(overview);
              setStatus({ type: 'success', message: 'Profiling data fetched successfully.' });
          } catch (error) {
              console.error("Error fetching profiling data:", error);
              const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch profiling data.';
              setOverviewData({ status: "failed", message: errorMessage });
              setStatus({ type: 'error', message: errorMessage });
          } finally {
              setIsFetchingOverview(false);
          }
     };


    // --- Table Group Actions ---

    // Handle opening the Add Table Group modal (same as before)
     const handleOpenAddTableGroupModal = () => {
         setShowAddTableGroupModal(true);
     };

     // Handle closing the Add Table Group modal and refreshing the list
     const handleCloseAddTableGroupModal = () => {
         setShowAddTableGroupModal(false);
         fetchTableGroupsList(); // Refresh the list after add modal closes
     };


     // Prepare to delete a table group (show confirmation dialog)
     // This is called when the Delete icon in the MenuItem is clicked
     const confirmDeleteTableGroup = (groupId) => {
         console.log("Attempting to confirm delete for group ID:", groupId);
         if (!groupId) {
              console.error("Cannot confirm delete, received invalid group ID:", groupId);
              setStatus({ type: 'error', message: 'Cannot delete: invalid group selected.' });
              return;
         }
         setGroupToDeleteId(groupId);
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
             return;
         }

         setIsDeletingTableGroup(true); // Start loading
         setStatus({}); // Clear previous status

         try {
             // Call the delete API function with correct arguments
             await deleteTableGroup(connection_id, groupToDeleteId);
             console.log("Table group deleted successfully!");
             setStatus({ type: 'success', message: 'Table group deleted successfully.' });

             // After deletion, refresh the list
             fetchTableGroupsList();

         } catch (error) {
             console.error("Failed to delete table group:", error);
             const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete table group.';
             setStatus({ type: 'error', message: errorMessage });
         } finally {
              setIsDeletingTableGroup(false); // Stop loading
              setGroupToDeleteId(null); // Clear the ID being deleted regardless of success/error
         }
     };

     // Cancel deletion
     const cancelDelete = () => {
         setGroupToDeleteId(null);
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
         setTableGroupToEdit(group); // Set the group data to be edited
         setShowEditTableGroupModal(true); // Open the edit modal
     };

     // Handle closing the Edit Table Group modal
     const handleCloseEditTableGroupModal = () => {
         setShowEditTableGroupModal(false);
         setTableGroupToEdit(null); // Clear the data being edited
         // Don't refresh the list here; onSave handler will do it.
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
         setStatus({}); // Clear previous status

         try {
             // Call the update API function with correct arguments
             // updatedData comes from the modal and should be the payload matching backend model
             await updateTableGroup(connection_id, tableGroupToEdit.group_id, updatedData);
             console.log("Table group updated successfully!");
             setStatus({ type: 'success', message: 'Table group updated successfully.' });

             // After successful update, refresh the list
             fetchTableGroupsList();

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
                             {/* Add Table Group Button */}
                             <Button
                                 variant="outlined"
                                 color="success"
                                 onClick={handleOpenAddTableGroupModal}
                             >
                                  + Add Table Group
                              </Button>
                        </Box>
                    )}

                    {/* Display Status Messages */}
                     {status.message && (
                         <Box
                             mt={2}
                             p={2}
                             bgcolor={status.type === 'success' ? 'success.dark' : 'error.dark'}
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

            {/* Right panel for Table Groups */}
            <Box sx={{ width: '30%', p: 2 }}>
                <StyledPaper sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
                    <Typography variant="h7" gutterBottom>
                        Select Table Group
                    </Typography>

                    {/* Table Group Select Dropdown */}
                    <FormControl fullWidth margin="normal" variant="outlined">
                        <InputLabel id="table-group-label">Select Table Group</InputLabel>
                        <Select
                            labelId="table-group-label"
                            id="table-group-select"
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)} // Standard change for selection
                            label="Select Table Group"
                             renderValue={(selected) => {
                                 // Find the selected group by its ID
                                 const group = tableGroups.find(g => g.group_id === selected);
                                 // Display table_group_name
                                 return group ? group.table_group_name : '';
                             }}
                             sx={{
                                '.MuiSelect-select': { color: '#fff' },
                                '.MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#888' },
                                '.MuiSvgIcon-root': { color: '#fff' },
                                '.MuiInputLabel-root': { color: '#aaa' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                                '&.Mui-focused .MuiInputLabel-root': { color: 'primary.main' },
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
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        width="100%"
                                    >
                                        {/* Corrected to use table_group_name */}
                                        <Typography>{group.table_group_name}</Typography>

                                        <Box display="flex" alignItems="center">
                                            {/* Edit Icon - Opens Edit Modal */}
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent MenuItem click
                                                    handleOpenEditTableGroupModal(group); // Pass the group data
                                                }}
                                                aria-label={`edit ${group.table_group_name}`} // Accessibility
                                                 sx={{ color: 'inherit' }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>

                                            {/* Delete Icon - Opens Delete Confirmation */}
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent MenuItem click
                                                    confirmDeleteTableGroup(group.group_id); // Pass the group ID
                                                }}
                                                aria-label={`delete ${group.table_group_name}`} // Accessibility
                                                 sx={{ color: 'inherit' }}
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
                            const selectedGroup = tableGroups.find((group) => group.group_id === selectedGroupId);
                            if (selectedGroup) {
                                 const payload = {
                                     connectionId: connection_id,
                                     connectionParams: connectionData,
                                     tableGroupParams: selectedGroup,
                                 };
                                 console.log('Payload for future API call with selected group:', payload);
                                  setStatus({ type: 'info', message: `Ready to run with group: ${selectedGroup.table_group_name}` });
                             } else {
                                  console.warn("Run button clicked but selected group details not found in list.");
                                  setStatus({ type: 'warning', message: 'Selected table group details not available.' });
                             }
                        }}
                         sx={{ mt: 2 }}
                    >
                        Run with Selected Group
                    </Button>

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
                    // Pass loading state down to modal button if needed
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
                        Are you sure you want to delete this table group? This action cannot be undone.
                        {/* Display the group name in the confirmation */}
                        {groupToDeleteId && tableGroups.find(g => g.group_id === groupToDeleteId)?.table_group_name ?
                           ` (${tableGroups.find(g => g.group_id === groupToDeleteId).table_group_name})` : ''}
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

// Ensure your API functions (getTableGroups, updateTableGroup, deleteTableGroup, etc.)
// are correctly imported or defined within reach.
// You MUST have the EditTableGroupModal.js component working correctly,
// accepting initialData and calling onSave(payload) when its save button is clicked.