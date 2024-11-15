
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Torneios: undefined;
  DetailsTorneio: { torneioId: number };
};

export type TorneiosNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Torneios'>;
export default RootStackParamList;
