import React, { useState } from 'react';
import {
    TextField,
    Grid,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Typography, // Added Typography for the title within the form
    CircularProgress // Import CircularProgress
} from '@mui/material';

// Import API functions from your dbapi file
import { testConnection, createConnection } from '../../api/dbapi';

// Assuming you have a list of supported database types
const supportedDatabaseTypes = [
    'PostgreSQL',
    'MySQL',
    'SQLite',
    'Oracle',
    'SQL Server',
    'MongoDB',
    'Snowflake',
    'Redshift',
    'Other Database',
];

/**
 * A form component for adding a new database connection.
 * Manages form state and calls provided handlers for actions.
 * @param {object} props - Component props.
 * @param {function} props.onCancel - Handler for the Cancel button.
 * @param {function} [props.onConnectionCreated] - Optional handler to call after a connection is successfully created (e.g., to refresh the list).
 */
const AddConnectionForm = ({ onCancel, onConnectionCreated }) => {
    // State to manage form input values
    const [formData, setFormData] = useState({
        connection_name: '',
        sql_flavor: '', // Corresponds to Database Type
        project_port: '', // Corresponds to Port
        project_host: '', // Corresponds to Host
        project_db: '', // Corresponds to Database
        project_user: '', // Corresponds to Username
        password: '', // Corresponds to Password
        connection_description: '', // Corresponds to Description
        project_code: '', // Assuming project_code is needed for creation
    });

    // State to manage loading and error states for API calls
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [testResult, setTestResult] = useState(null); // State to store test connection result

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle form submission for Create
    const handleSubmitCreate = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setLoading(true);
        setError(null);
        setTestResult(null); // Clear previous test results

        // Map form data keys to API payload keys for createConnection
        const createPayload = {
            project_code: formData.project_code,
            connection_name: formData.connection_name,
            connection_description: formData.connection_description || null,
            sql_flavor: formData.sql_flavor,
            project_host: formData.project_host,
            project_port: formData.project_port, // This should be a string from the form now
            project_user: formData.project_user,
            password: formData.password,
            project_db: formData.project_db,
        };

        try {
            const newConnection = await createConnection(createPayload);
            console.log('Connection created successfully:', newConnection);
            // Call the optional handler provided by the parent
            if (onConnectionCreated) {
                onConnectionCreated(newConnection);
            }
            // Optionally reset the form or close the modal/card
            // setFormData({ ...initial state or empty strings... });
            // onCancel(); // Close the form
        } catch (err) {
            console.error('Error creating connection:', err);
            setError(err);
            // Handle error (e.g., display an error message on the form)
        } finally {
            setLoading(false);
        }
    };

     // Handle form submission for Test Connection
     const handleSubmitTest = async (e) => {
         e.preventDefault(); // Prevent default form submission
         setLoading(true);
         setError(null);
         setTestResult(null); // Clear previous test results

         // Map form data keys to API payload keys for testConnection
         const testPayload = {
             sql_flavor: formData.sql_flavor,
             // Assuming db_hostname corresponds to project_host
             db_hostname: formData.project_host,
             // Assuming db_port corresponds to project_port, and API expects integer
             db_port: formData.project_port ? parseInt(formData.project_port, 10) : null,
             // Assuming user_id corresponds to project_user
             user_id: formData.project_user,
             password: formData.password,
             // Assuming database corresponds to project_db
             database: formData.project_db,
         };

         try {
             const result = await testConnection(testPayload);
             console.log('Test connection result:', result);
             setTestResult(result); // Store the test result
             // Optionally display a success/failure message based on result.status
         } catch (err) {
             console.error('Error testing connection:', err);
             setError(err);
             // Store error result with a status of false or 'error' to indicate failure
             setTestResult({ status: false, message: err.message || 'An error occurred during testing.' });
         } finally {
             setLoading(false);
         }
     };


    return (
        <Box component="form" onSubmit={handleSubmitCreate} noValidate autoComplete="off">
             {/* Note: The CloseIcon is handled in the parent (HomepageLayout) */}
             <Typography variant="h6" mb={2}>Add Connection</Typography> {/* Added title here */}

            <TextField
                fullWidth
                label="Connection Name"
                variant="outlined"
                margin="normal"
                size="small"
                name="connection_name"
                value={formData.connection_name}
                onChange={handleInputChange}
                disabled={loading}
            />
            <FormControl fullWidth margin="normal" size="small" disabled={loading}>
                <InputLabel id="database-type-label">Database Type</InputLabel>
                <Select
                    labelId="database-type-label"
                    id="database-type"
                    value={formData.sql_flavor}
                    label="Database Type"
                    onChange={handleInputChange}
                    name="sql_flavor"
                >
                    {supportedDatabaseTypes.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                </Select>
            </FormControl >
            <Grid container spacing={4} mb={2}>
                 {/* Assuming 'Sort' label is actually 'Port' based on typical connection details */}
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Port" // Changed label to Port
                        variant="outlined"
                        size="small"
                        name="project_port"
                        value={formData.project_port}
                        onChange={handleInputChange}
                        type="number" // Assuming port is a number
                        disabled={loading}
                    />
                </Grid>
                <Grid item xs={6}>
                     {/* This field seems redundant based on the screenshot, keeping it for now but might need clarification */}
                    {/* <TextField fullWidth label="5432" variant="outlined" size="small" disabled/> */}
                </Grid>
            </Grid>
            <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Host"
                        variant="outlined"
                        size="small"
                        name="project_host"
                        value={formData.project_host}
                        onChange={handleInputChange}
                        disabled={loading}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Database"
                        variant="outlined"
                        size="small"
                        name="project_db"
                        value={formData.project_db}
                        onChange={handleInputChange}
                        disabled={loading}
                    />
                </Grid>
            </Grid>
             {/* Assuming Project Code is needed for creation based on your dbapi */}
             <TextField
                 fullWidth
                 label="Project Code"
                 variant="outlined"
                 margin="normal"
                 size="small"
                 name="project_code"
                 value={formData.project_code}
                 onChange={handleInputChange}
                 disabled={loading}
             />
            <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                size="small"
                name="project_user"
                value={formData.project_user}
                onChange={handleInputChange}
                disabled={loading}
            />
            <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                size="small"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
            />
            <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                variant="outlined"
                margin="normal"
                size="small"
                name="connection_description"
                value={formData.connection_description}
                onChange={handleInputChange}
                disabled={loading}
            />

            {/* Display loading, error, or test result messages */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                        {testResult ? 'Testing...' : 'Creating...'}
                    </Typography>
                </Box>
            )}
            {error && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                    Error: {error.message || 'An unexpected error occurred.'}
                </Typography>
            )}
            {testResult && !loading && (
                <Typography variant="body2" color={testResult.status === true ? 'success.main' : 'error.main'} sx={{ mt: 2 }}>
                    Test Result: {testResult.status === true ? 'Successful' : 'Failed'} - {testResult.message}
                </Typography>
            )}


            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={onCancel} disabled={loading}>Cancel</Button>
                 {/* Use type="button" to prevent this button from submitting the form */}
                <Button variant="contained" size="small" onClick={handleSubmitTest} type="button" disabled={loading}>Test Connection</Button>
                 {/* This button will trigger the form's onSubmit */}
                <Button variant="contained" size="small" type="submit" disabled={loading}>Create</Button>
            </Box>
        </Box>
    );
};

export default AddConnectionForm;
