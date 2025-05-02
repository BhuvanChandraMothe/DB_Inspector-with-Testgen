import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
  getAllConnections,
  getTableGroups,
  triggerProfiling,
} from "../api/dbapi";

const NewProfilingRunDialog = ({ open, onClose, onRunSuccess }) => {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState("");
  const [tableGroups, setTableGroups] = useState([]);
  const [selectedTableGroup, setSelectedTableGroup] = useState("");
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [loadingTableGroups, setLoadingTableGroups] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchConnections();
      // Reset selections each time dialog opens
      setSelectedConnection("");
      setSelectedTableGroup("");
    }
  }, [open]);

  const fetchConnections = async () => {
    setLoadingConnections(true);
    try {
      const data = await getAllConnections();
      setConnections(data);
    } catch (error) {
      console.error("Error loading connections:", error);
    } finally {
      setLoadingConnections(false);
    }
  };

  const loadTableGroups = async (connectionId) => {
    setLoadingTableGroups(true);
    try {
      const groups = await getTableGroups(connectionId);
      setTableGroups(groups);
    } catch (error) {
      console.error("Error loading table groups:", error);
    } finally {
      setLoadingTableGroups(false);
    }
  };

  const handleConnectionChange = (event) => {
    const connId = event.target.value;
    setSelectedConnection(connId);
    setSelectedTableGroup("");
    if (connId) {
      loadTableGroups(connId);
    }
  };

  const handleRunProfiling = async () => {
    if (!selectedConnection || !selectedTableGroup) return;
    setSubmitting(true);
    try {
      await triggerProfiling({
        connection_id: selectedConnection,
        table_group_id: selectedTableGroup,
      });

      if (onRunSuccess) onRunSuccess(); // Notify parent to refresh grid
      onClose(); // Close dialog
    } catch (error) {
      console.error("Error triggering profiling:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { backgroundColor: "#1e1e1e", color: "#fff" },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Create New Profiling Run</Typography>
        <IconButton onClick={onClose} color="inherit">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ color: "#ccc" }}>Select Connection</InputLabel>
          <Select
            value={selectedConnection}
            label="Select Connection"
            onChange={handleConnectionChange}
            disabled={loadingConnections}
            sx={{ color: "#fff", ".MuiSvgIcon-root": { color: "#fff" } }}
          >
            {loadingConnections ? (
              <MenuItem disabled>
                <CircularProgress size={20} />
              </MenuItem>
            ) : (
              connections.map((conn) => (
                <MenuItem key={conn.id} value={conn.integer_id}>
                  {conn.name || conn.integer_id}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel sx={{ color: "#ccc" }}>Select Table Group</InputLabel>
          <Select
            value={selectedTableGroup}
            label="Select Table Group"
            onChange={(e) => setSelectedTableGroup(e.target.value)}
            disabled={!selectedConnection || loadingTableGroups}
            sx={{ color: "#fff", ".MuiSvgIcon-root": { color: "#fff" } }}
          >
            {loadingTableGroups ? (
              <MenuItem disabled>
                <CircularProgress size={20} />
              </MenuItem>
            ) : tableGroups.length > 0 ? (
              tableGroups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name || group.id}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No table groups found</MenuItem>
            )}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleRunProfiling}
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          disabled={submitting || !selectedConnection || !selectedTableGroup}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : "Run Profiling"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewProfilingRunDialog;
