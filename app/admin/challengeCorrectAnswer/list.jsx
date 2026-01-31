import {
    Datagrid,
    List,
    NumberField,
    ReferenceField,
    TextField,
    BooleanField,
} from "react-admin";

export const ChallengeCorrectAnswerList = () => {
    return (
        <List>
            <Datagrid rowClick="edit">
                <NumberField source="id" />
                <ReferenceField source="challengeId" reference="challenges" />
                <TextField source="answer" />
                <BooleanField source="isCaseSensitive" label="Case Sensitive" />
            </Datagrid>
        </List>
    );
};
