import React, { useState } from "react";
import { AggregateCredits } from "../../../models/tv-show-details.model";
import {
  Box,
  Tab,
  Tabs,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import theme from "../../theme";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { renderTextField } from "./RenderTextField";

interface TvShowCastAndCrewProps {
  aggregateCredits: AggregateCredits;
}

interface PersonListItemProps {
  id: number;
  index: number;
  name: string;
  profilePath: string | null;
  description: string;
}

const PersonListItem: React.FC<PersonListItemProps> = ({
  id,
  index,
  name,
  profilePath,
  description,
}) => {
  const { getTmdbImageUrl } = useTmdbImageUrl();

  const listItemTextStyles = {
    marginLeft: 2,
    "& .MuiListItemText-primary": {
      color: theme.customVariables.appWhiteSmoke,
    },
    "& .MuiListItemText-secondary": {
      color: theme.customVariables.appWhiteSmoke,
    },
  };

  return (
    <ListItem key={`${id}-${index}`}>
      <ListItemAvatar>
        <Avatar
          sx={{ width: 65, height: 65 }}
          src={profilePath ? getTmdbImageUrl(profilePath) : undefined}
          alt={name}
        />
      </ListItemAvatar>
      <ListItemText
        sx={listItemTextStyles}
        primary={name}
        secondary={description}
      />
    </ListItem>
  );
};

export const TvShowCastAndCrew: React.FC<TvShowCastAndCrewProps> = ({
  aggregateCredits,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filterPersons = (persons: Array<{
    id: number;
    name: string;
    profile_path: string | null;
    description: string;
  }>) => {
    return persons.filter(
      person =>
        person.name.toLowerCase().includes(searchQuery) ||
        person.description.toLowerCase().includes(searchQuery)
    );
  };

  const castMembers = aggregateCredits.cast.map(castMember => ({
    id: castMember.id,
    name: castMember.name,
    profile_path: castMember.profile_path,
    description: `Character: ${castMember.roles.map(role => role.character).join(", ")}`,
  }));

  const crewMembers = aggregateCredits.crew.map(crewMember => ({
    id: crewMember.id,
    name: crewMember.name,
    profile_path: crewMember.profile_path,
    description: `Jobs: ${crewMember.jobs.map(job => job.job).join(", ")}`,
  }));

  const renderPersonList = (persons: Array<{
    id: number;
    name: string;
    profile_path: string | null;
    description: string;
  }>) => (
    <List>
      {persons.map((person, index) => (
        <PersonListItem
          key={`${person.id}-${index}`}
          id={person.id}
          index={index}
          name={person.name}
          profilePath={person.profile_path}
          description={person.description}
        />
      ))}
    </List>
  );

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="Cast" />
        <Tab label="Crew" />
      </Tabs>
      <Box p={2}>
        {tabValue === 0 && (
          <>
            {renderTextField(
              "Search cast by name or character",
              searchQuery,
              handleSearchChange,
              theme
            )}
            {renderPersonList(filterPersons(castMembers))}
          </>
        )}
        {tabValue === 1 && renderPersonList(crewMembers)}
      </Box>
    </Box>
  );
};
